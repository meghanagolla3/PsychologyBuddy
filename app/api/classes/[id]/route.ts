import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';
import { withPermission } from '@/src/middleware/permission.middleware';

// PATCH /api/classes/[id] - Update class (Admin only)
export const PATCH = withPermission({ 
  module: 'USER_MANAGEMENT', 
  action: 'UPDATE' 
})(async (req: NextRequest, { user, userSchoolId }: any) => {
  try {
    const classId = req.nextUrl.pathname.split('/').pop();
    if (!classId) {
      return Response.json(
        { success: false, message: 'Class ID is required' },
        { status: 400 }
      );
    }
    const body = await req.json();
    const updatedClass = await UserService.updateClass(classId, body, userSchoolId);
    return Response.json(updatedClass);
  } catch (error) {
    console.error('Update class error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
