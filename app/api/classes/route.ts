import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// POST /api/classes - Create class (Admin only)
export const POST = withPermission({ 
  module: 'USER_MANAGEMENT', 
  action: 'UPDATE' // Classes management falls under user management
})(async (req: NextRequest, { user, userSchoolId }: any) => {
  try {
    const body = await req.json();
    
    // Debug logging
    console.log('User:', user);
    console.log('UserSchoolId:', userSchoolId);
    
    // Validate required fields
    if (!body.name || !body.grade) {
      return Response.json(
        { success: false, message: 'Name and grade are required' },
        { status: 400 }
      );
    }

    // For SUPERADMIN, we need to ensure they have a schoolId or get it from request
    let schoolId = userSchoolId;
    if (!schoolId && user.role.name === 'SUPERADMIN') {
      // For SUPERADMIN, either require schoolId in body or use a default
      if (!body.schoolId) {
        return Response.json(
          { success: false, message: 'School ID is required for SUPERADMIN' },
          { status: 400 }
        );
      }
      schoolId = body.schoolId;
    }

    if (!schoolId) {
      return Response.json(
        { success: false, message: 'School ID is required' },
        { status: 400 }
      );
    }

    const newClass = await UserService.createClass({
      ...body,
      schoolId, // Use the determined schoolId
    });
    return Response.json(newClass);
  } catch (error) {
    console.error('Create class error:', error);
    const errorResponse = handleError(error);
    return Response.json(errorResponse, { status: errorResponse.error.code });
  }
});

// GET /api/classes - Get classes (Admin only - their school only)
export const GET = withPermission({ 
  module: 'USER_MANAGEMENT', 
  action: 'VIEW' 
})(async (req: NextRequest, { user, userSchoolId }: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      grade: searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : undefined,
      section: searchParams.get('section') || undefined,
      search: searchParams.get('search') || undefined,
    };
    
    // For SUPERADMIN, if no schoolId is assigned, get all classes
    // For regular admins, use their assigned schoolId
    let schoolId;
    if (user.role.name === 'SUPERADMIN') {
      schoolId = userSchoolId || undefined; // Convert null to undefined
    } else {
      schoolId = userSchoolId; // Must exist for non-SUPERADMIN
    }
    
    const classes = await UserService.getClasses(schoolId, filters);
    return Response.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    const errorResponse = handleError(error);
    return Response.json(errorResponse, { status: errorResponse.error.code });
  }
});
