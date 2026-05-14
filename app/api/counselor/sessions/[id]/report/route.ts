import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService } from '@/src/server/counseling/counseling.service';
import prisma from '@/src/prisma';

const counselingService = new CounselingService();

// Get Follow-up Report Data
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
        previousSession: {
          select: {
            id: true,
            scheduledAt: true,
            sessionType: true,
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

    if (session.sessionType !== 'FOLLOW_UP') {
      return NextResponse.json(
        { success: false, message: 'This is not a follow-up session' },
        { status: 400 }
      );
    }

    // Get existing report or create draft
    let report = await prisma.sessionReport.findUnique({
      where: { sessionId: id },
    });

    if (!report) {
      // Create draft report
      report = await prisma.sessionReport.create({
        data: {
          sessionId: id,
          behavioralTags: [],
          summary: '',
          recommendations: [],
          notes: '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        session,
      },
    });
  } catch (error: any) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get report data' },
      { status: 500 }
    );
  }
});

// Save Follow-up Report Draft
export const PATCH = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'UPDATE',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    const reportData = await req.json();

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

    // Update or create report
    const report = await prisma.sessionReport.upsert({
      where: { sessionId: id },
      update: {
        behavioralTags: reportData.behavioralTags || [],
        summary: reportData.summary || '',
        recommendations: reportData.recommendations || [],
        notes: reportData.notes || '',
      },
      create: {
        sessionId: id,
        behavioralTags: reportData.behavioralTags || [],
        summary: reportData.summary || '',
        recommendations: reportData.recommendations || [],
        notes: reportData.notes || '',
      },
    });

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report draft saved successfully',
    });
  } catch (error: any) {
    console.error('Save report error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save report draft' },
      { status: 500 }
    );
  }
});
