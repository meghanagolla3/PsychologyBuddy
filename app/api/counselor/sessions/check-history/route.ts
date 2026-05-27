import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (request: NextRequest, { user }: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check if the student has had any previous counseling sessions
    const previousSessions = await prisma.counselingSession.findMany({
      where: {
        studentId: studentId,
        status: 'COMPLETED'
      },
      select: {
        id: true,
        sessionType: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    });

    const hasPreviousSessions = previousSessions.length > 0;
    const sessionType = hasPreviousSessions ? 'FOLLOW_UP' : 'INTAKE';

    return NextResponse.json({
      success: true,
      data: {
        hasPreviousSessions,
        sessionType,
        previousSessionCount: previousSessions.length,
        lastSession: previousSessions[0] || null
      }
    });

  } catch (error) {
    console.error('Error checking student session history:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

