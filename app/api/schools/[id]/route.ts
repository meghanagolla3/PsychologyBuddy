import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';
import { withPermission } from '@/src/middleware/permission.middleware';

// PATCH /api/schools/[id] - Update school (Superadmin only)
export const PATCH = withPermission({ 
  module: 'ORGANIZATIONS', 
  action: 'UPDATE' 
})(async (req: NextRequest, { user }: any) => {
  try {
    const schoolId = req.nextUrl.pathname.split('/').pop();
    if (!schoolId) {
      return Response.json(
        { success: false, message: 'School ID is required' },
        { status: 400 }
      );
    }
    const body = await req.json();
    const school = await UserService.updateSchool(schoolId, body);
    return Response.json(school);
  } catch (error) {
    console.error('Update school error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// GET /api/schools/[id] - Get school by ID (Superadmin only)
export const GET = withPermission({ 
  module: 'ORGANIZATIONS', 
  action: 'VIEW' 
})(async (req: NextRequest) => {
  try {
    const schoolId = req.nextUrl.pathname.split('/').pop();
    if (!schoolId) {
      return Response.json(
        { success: false, message: 'School ID is required' },
        { status: 400 }
      );
    }
    const school = await UserService.getSchoolById(schoolId);
    return Response.json(school);
  } catch (error) {
    console.error('Get school error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
