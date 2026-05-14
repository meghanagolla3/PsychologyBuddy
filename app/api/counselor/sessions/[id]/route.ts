import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService, updateSessionSchema, startSessionSchema, completeSessionSchema, cancelSessionSchema } from '@/src/server/counseling/counseling.service';

const counselingService = new CounselingService();

// Helper to get user info from request
function getUserFromRequest(req: NextRequest) {
  return {
    id: (req as any).user?.id,
    role: (req as any).user?.role?.name,
    schoolId: (req as any).user?.schoolId,
  };
}

// Get Session Details
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

    const session = await counselingService.getSessionById(id, user.schoolId, user.id, user.role?.name);
    
    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Get session details error:', error);
    
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

    return NextResponse.json(
      { success: false, message: 'Failed to fetch session details' },
      { status: 500 }
    );
  }
});

// Update Session
export const PATCH = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'UPDATE',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    
    if (!user.id || !user.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = updateSessionSchema.parse(body);

    const session = await counselingService.updateSession(
      id,
      user.schoolId,
      user.id,
      user.role,
      validatedData
    );
    
    return NextResponse.json({
      success: true,
      data: session,
      message: 'Session updated successfully',
    });
  } catch (error: any) {
    console.error('Update session error:', error);
    
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

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update session' },
      { status: 500 }
    );
  }
});
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update session' },
      { status: 500 }
    );
  }
});
