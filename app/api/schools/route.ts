import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// POST /api/schools - Create school (Superadmin only)
export const POST = withPermission({ 
  module: 'ORGANIZATIONS', 
  action: 'CREATE' 
})(async (req: NextRequest, { user }: any) => {
  try {
    const body = await req.json();
    const school = await UserService.createSchool(body);
    return Response.json(school);
  } catch (error) {
    console.error('Create school error:', error);
    const errorResponse = handleError(error);
    return Response.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// GET /api/schools - Get all schools (Superadmin only)
export const GET = withPermission({ 
  module: 'ORGANIZATIONS', 
  action: 'VIEW' 
})(async (req: NextRequest) => {
  try {
    const schools = await UserService.getAllSchools();
    return Response.json(schools);
  } catch (error) {
    console.error('Get schools error:', error);
    const errorResponse = handleError(error);
    return Response.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// DELETE /api/schools/[id] - Delete school (Superadmin only)
export const DELETE = withPermission({ 
  module: 'ORGANIZATIONS', 
  action: 'DELETE' 
})(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = params;
    const result = await UserService.deleteSchool(id);
    return Response.json(result);
  } catch (error) {
    console.error('Delete school error:', error);
    const errorResponse = handleError(error);
    return Response.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
