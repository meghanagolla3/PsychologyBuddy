import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService, startSessionSchema } from '@/src/server/counseling/counseling.service';

const counselingService = new CounselingService();

// Start Session
export const POST = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'RESPOND',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    console.log(`[StartSessionAPI] Starting session ${id} for user ${user.id} (${user.firstName} ${user.lastName})`);
    
    if (!user.id || !user.schoolId) {
      console.log(`[StartSessionAPI] Authentication failed: user.id=${user.id}, user.schoolId=${user.schoolId}`);
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    console.log(`[StartSessionAPI] Calling counselingService.startSession...`);
    const session = await counselingService.startSession(id, user.schoolId, user.id);
    console.log(`[StartSessionAPI] Session started successfully:`, {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt
    });
    
    return NextResponse.json({
      success: true,
      data: session,
      message: 'Session started successfully',
    });
  } catch (error: any) {
    console.error('Start session error:', error);
    
    if (error.message === 'Session not found') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error.message === 'Access denied') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      );
    }

    if (error.message === 'Session can only be started if it is scheduled') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    if (error.message.includes('Session cannot be started yet')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to start session' },
      { status: 500 }
    );
  }
});
