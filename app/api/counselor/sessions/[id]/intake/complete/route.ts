import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService } from '@/src/server/counseling/counseling.service';
import prisma from '@/src/prisma';

const counselingService = new CounselingService();

// Complete Intake and Create Follow-up Session
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

    // Get the current intake session
    const currentSession = await prisma.counselingSession.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
        counselorId: user.id,
        sessionType: 'INTAKE',
      },
      include: {
        student: true,
        escalation: true,
      },
    });

    if (!currentSession) {
      return NextResponse.json(
        { success: false, message: 'Intake session not found' },
        { status: 404 }
      );
    }

    // Save the completed intake
    const intake = await prisma.sessionIntake.upsert({
      where: { sessionId: id },
      update: {
        basicInfo: intakeData.basicInfo || {},
        complaints: intakeData.complaints || {},
        factors: intakeData.factors || {},
        familyHistory: intakeData.familyHistory || '',
        personalHistory: intakeData.personalHistory || {},
        sessionReport: intakeData.sessionReport || {},
        status: 'COMPLETED',
      },
      create: {
        sessionId: id,
        basicInfo: intakeData.basicInfo || {},
        complaints: intakeData.complaints || {},
        factors: intakeData.factors || {},
        familyHistory: intakeData.familyHistory || '',
        personalHistory: intakeData.personalHistory || {},
        sessionReport: intakeData.sessionReport || {},
        status: 'COMPLETED',
      },
    });

    // Mark current session as completed
    await prisma.counselingSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });

    // Update escalation status if this session was created from an escalation
    if (currentSession.escalationId) {
      await prisma.escalationAlert.update({
        where: { id: currentSession.escalationId },
        data: {
          status: 'resolved',
          notes: 'Intake session completed',
        },
      });
    }

    // Create follow-up session
    const followUpSession = await prisma.counselingSession.create({
      data: {
        studentId: currentSession.studentId,
        counselorId: currentSession.counselorId,
        schoolId: currentSession.schoolId,
        classId: currentSession.classId,
        section: currentSession.section,
        sessionType: 'FOLLOW_UP',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        previousSessionId: id,
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

    // The followUpSession already references the current session via previousSessionId, so the relation is established.

    return NextResponse.json({
      success: true,
      data: {
        intake,
        currentSession: {
          ...currentSession,
          status: 'COMPLETED',
          endedAt: new Date(),
          nextSessionId: followUpSession.id,
        },
        followUpSession,
      },
      message: 'Intake completed successfully and follow-up session scheduled',
    });
  } catch (error: any) {
    console.error('Complete intake error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to complete intake',
        error: error.message,
        details: {
          name: error.name,
          code: error.code,
          meta: error.meta
        }
      },
      { status: 500 }
    );
  }
});
