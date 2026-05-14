import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService } from '@/src/server/counseling/counseling.service';
import prisma from '@/src/prisma';
import { SessionStatus } from '@/src/generated/prisma/client';

const counselingService = new CounselingService();

// Get Intake Data
export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;

    if (!user.id || !user.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    // Check if session exists and belongs to user's school
    const session = await prisma.counselingSession.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
        counselorId: user.id,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.sessionType !== 'INTAKE') {
      return NextResponse.json(
        { success: false, message: 'This is not an intake session' },
        { status: 400 }
      );
    }

    // Get existing intake or create draft
    let intake = await prisma.sessionIntake.findUnique({
      where: { sessionId: id },
    });

    if (!intake) {
      // Create draft intake
      intake = await prisma.sessionIntake.create({
        data: {
          sessionId: id,
          basicInfo: {},
          complaints: {},
          factors: {},
          familyHistory: '',
          personalHistory: {},
          sessionReport: {},
          status: 'DRAFT',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: intake,
    });
  } catch (error: any) {
    console.error('Get intake error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get intake data' },
      { status: 500 }
    );
  }
});

// Save Intake Data (POST for new/complete, PATCH for draft updates)
export const POST = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'UPDATE',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    const intakeData = await req.json();

    if (!user.id || !user.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    // Check if session exists and belongs to user
    const session = await prisma.counselingSession.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
        counselorId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Map frontend data structure to backend structure
    const mappedData = {
      basicInfo: intakeData.basicInfo || {},
      complaints: intakeData.chiefComplaints || {},
      factors: {
        predisposing: intakeData.predisposingFactors || [],
      },
      familyHistory: intakeData.familyHistory || '',
      personalHistory: {
        text: intakeData.personalHistory || '',
      },
      sessionReport: intakeData.sessionReport || {},
      status: intakeData.status || 'DRAFT',
    };

    console.log('Mapped intake data:', mappedData);

    // Update or create intake
    const intake = await prisma.sessionIntake.upsert({
      where: { sessionId: id },
      update: mappedData,
      create: {
        sessionId: id,
        ...mappedData,
      },
    });

    // If intake status is COMPLETED, also update the counselingSession status
    if (intakeData.status === 'COMPLETED') {
      const updateData: any = {
        status: SessionStatus.COMPLETED,
        endedAt: new Date(),
      };

      // If session is still SCHEDULED, also set startedAt
      if (session.status === SessionStatus.SCHEDULED) {
        updateData.startedAt = new Date();
      }

      try {
        const updatedSession = await prisma.counselingSession.update({
          where: { id },
          data: updateData,
        });

        // Resolve any related escalation alerts when session is completed
        if (updatedSession.escalationId) {
          try {
            await prisma.escalationAlert.update({
              where: { id: updatedSession.escalationId },
              data: {
                status: 'resolved',
                updatedAt: new Date(),
              },
            });
          } catch (escalationError) {
            // Don't fail the whole request if escalation update fails
          }
        }
      } catch (updateError) {
        // Don't fail the whole request if session update fails, but log it
      }
    }

    return NextResponse.json({
      success: true,
      data: intake,
      message: 'Intake data saved successfully',
    });
  } catch (error: any) {
    console.error('Save intake error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save intake data' },
      { status: 500 }
    );
  }
});

// Save Intake Draft
export const PATCH = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'UPDATE',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    const intakeData = await req.json();

    if (!user.id || !user.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    // Check if session exists and belongs to user
    const session = await prisma.counselingSession.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
        counselorId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Update or create intake
    const intake = await prisma.sessionIntake.upsert({
      where: { sessionId: id },
      update: {
        basicInfo: intakeData.basicInfo || {},
        complaints: intakeData.complaints || {},
        factors: intakeData.factors || {},
        familyHistory: intakeData.familyHistory || '',
        personalHistory: intakeData.personalHistory || {},
        sessionReport: intakeData.sessionReport || {},
        status: intakeData.status || 'DRAFT',
      },
      create: {
        sessionId: id,
        basicInfo: intakeData.basicInfo || {},
        complaints: intakeData.complaints || {},
        factors: intakeData.factors || {},
        familyHistory: intakeData.familyHistory || '',
        personalHistory: intakeData.personalHistory || {},
        sessionReport: intakeData.sessionReport || {},
        status: intakeData.status || 'DRAFT',
      },
    });

    return NextResponse.json({
      success: true,
      data: intake,
      message: 'Intake draft saved successfully',
    });
  } catch (error: any) {
    console.error('Save intake error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save intake draft' },
      { status: 500 }
    );
  }
});
