import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService, updateSessionSchema } from '@/src/server/counseling/counseling.service';

const counselingService = new CounselingService();

// Get Session Details
export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { params, user, userSchoolId }: any) => {
  try {
    const { id } = await params;
    
    const isSuperAdmin = user.role?.name === 'SUPERADMIN';
    const schoolId = userSchoolId || user.schoolId;

    if (!user.id || (!schoolId && !isSuperAdmin)) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    const session = await counselingService.getSessionById(id, schoolId, user.id, user.role?.name);
    
    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Get session details error:', error);
    
    const status = error.message.includes('Access denied') ? 403 : 
                   error.message === 'Session not found' ? 404 : 500;

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch session details' },
      { status }
    );
  }
});

// Update Session (Minimal restoration)
export const PATCH = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'UPDATE',
})(async (req: NextRequest, { params, user, userSchoolId }: any) => {
  try {
    const { id } = await params;
    
    const isSuperAdmin = user.role?.name === 'SUPERADMIN';
    const schoolId = userSchoolId || user.schoolId;

    if (!user.id || (!schoolId && !isSuperAdmin)) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = updateSessionSchema.parse(body);

    const session = await counselingService.updateSession(
      id,
      schoolId,
      user.id,
      user.role?.name,
      validatedData
    );
    
    return NextResponse.json({
      success: true,
      data: session,
      message: 'Session updated successfully',
    });
  } catch (error: any) {
    console.error('Update session error:', error);
    
    const status = error.message.includes('Access denied') ? 403 : 
                   error.message === 'Session not found' ? 404 : 
                   error.name === 'ZodError' ? 400 : 500;

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update session' },
      { status }
    );
  }
});
