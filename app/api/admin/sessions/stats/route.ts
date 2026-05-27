import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService } from '@/src/server/counseling/counseling.service';

const counselingService = new CounselingService();

// Helper to get user info from request
function getUserFromRequest(req: NextRequest) {
  return {
    id: (req as any).user?.id,
    role: (req as any).user?.role?.name,
    schoolId: (req as any).user?.schoolId,
  };
}

// Get Session Statistics
export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    const userInfo = getUserFromRequest(req);
    
    if (!userInfo.id || !userInfo.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    // Only admins can access stats
    if (!['ADMIN', 'SCHOOL_SUPERADMIN', 'SUPERADMIN'].includes(userInfo.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admins only.' },
        { status: 403 }
      );
    }

    const stats = await counselingService.getSessionStats(userInfo.schoolId);
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get session stats error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch session statistics' },
      { status: 500 }
    );
  }
});

