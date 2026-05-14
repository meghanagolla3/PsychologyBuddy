import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService, cancelSessionSchema } from '@/src/server/counseling/counseling.service';

const counselingService = new CounselingService();

// Cancel Session
export const POST = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    
    const userInfo = {
      id: user?.id,
      role: user?.role?.name,
      schoolId: user?.schoolId,
    };
    
    if (!userInfo.id || !userInfo.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    let validatedData = {};
    try {
      const body = await req.json();
      validatedData = cancelSessionSchema.parse(body);
    } catch (error) {
      // Handle empty body or invalid JSON
      validatedData = { reason: 'Cancelled by counselor' };
    }

    const session = await counselingService.cancelSession(id, userInfo.schoolId, userInfo.id, validatedData);
    
    return NextResponse.json({
      success: true,
      data: session,
      message: 'Session cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel session error:', error);
    
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

    if (error.message === 'Only scheduled sessions can be cancelled') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to cancel session' },
      { status: 500 }
    );
  }
});
