import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService } from '@/src/server/counseling/counseling.service';

const counselingService = new CounselingService();

// Get all sessions for admin (across all counselors)
export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { user, userSchoolId }: any) => {
  try {
    console.log('Admin sessions API - User context:', {
      userId: user?.id,
      userRole: user?.role?.name,
      userSchoolId,
      schoolIdFromUser: user?.schoolId,
      schoolFromUser: user?.school
    });

    const schoolId = userSchoolId || user?.school?.id || user?.schoolId;
    
    // SUPERADMINs can access all sessions without a school assignment
    const isSuperAdmin = user?.role?.name === 'SUPERADMIN';
    
    if (!user?.id || (!schoolId && !isSuperAdmin)) {
      console.error('User validation failed:', {
        hasUserId: !!user?.id,
        hasSchoolId: !!schoolId,
        isSuperAdmin,
        userSchoolId,
        userSchool: user?.school
      });
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const filters: any = {};
    
    // Status filter
    const statusParam = searchParams.get('status');
    if (statusParam) {
      filters.status = statusParam.split(',');
    }

    // Session type filter
    const sessionType = searchParams.get('sessionType');
    if (sessionType) {
      filters.sessionType = sessionType;
    }

    // Other filters
    const classId = searchParams.get('classId');
    if (classId) filters.classId = classId;

    const counselorId = searchParams.get('counselorId');
    if (counselorId) filters.counselorId = counselorId;

    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) filters.dateFrom = new Date(dateFrom);

    const dateTo = searchParams.get('dateTo');
    if (dateTo) filters.dateTo = new Date(dateTo);

    const search = searchParams.get('search');
    if (search) filters.search = search;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Higher limit for admin view

    // For admin, get all sessions in the school (not restricted to own sessions)
    // For SUPERADMINs without school assignment, pass null to get all sessions across all schools
    // For other admins, pass the schoolId to get sessions from their school
    const result = await counselingService.getSessions(
      isSuperAdmin ? null : schoolId,
      null, // null userId to get all sessions for admin
      user.role.name,
      filters,
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: result.sessions,
      pagination: {
        total: result.total,
        totalPages: result.totalPages,
        page: result.page,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Get admin sessions error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
});
