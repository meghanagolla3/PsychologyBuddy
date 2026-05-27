import { CounselingService, createSessionSchema, updateSessionSchema, startSessionSchema, completeSessionSchema, cancelSessionSchema } from './counseling.service';
import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';

const counselingService = new CounselingService();

// Helper to get user info from request
function getUserFromRequest(req: NextRequest) {
  return {
    id: (req as any).user?.id,
    role: (req as any).user?.role?.name,
    schoolId: (req as any).user?.schoolId,
  };
}

// Create Session
export const POST = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'CREATE',
})(async (req: NextRequest) => {
  try {
    const user = getUserFromRequest(req);
    
    if (!user.id || !user.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validatedData = createSessionSchema.parse(body);

    // Create session
    const session = await counselingService.createSession(user.id, user.schoolId, validatedData);

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Session created successfully',
    });
  } catch (error: any) {
    console.error('Create session error:', error);
    
    if (error.message.includes('already have a session scheduled')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    if (error.message.includes('must be scheduled for a future time')) {
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
      { success: false, message: 'Failed to create session' },
      { status: 500 }
    );
  }
});

// Get Sessions with filters
export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest) => {
  try {
    const user = getUserFromRequest(req);
    
    if (!user.id || !user.schoolId) {
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
    const limit = parseInt(searchParams.get('limit') || '10');

    // Tab filter (upcoming, completed, cancelled)
    const tab = searchParams.get('tab') as 'upcoming' | 'completed' | 'cancelled';
    
    let result;
    if (tab) {
      result = await counselingService.getSessionsByTab(
        tab,
        user.schoolId,
        user.id,
        user.role,
        filters,
        page,
        limit
      );
    } else {
      result = await counselingService.getSessions(
        user.schoolId,
        user.id,
        user.role,
        filters,
        page,
        limit
      );
    }

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
    console.error('Get sessions error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
});

