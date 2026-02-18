import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// GET /api/admin/schools - Get all schools for admin tools (Superadmin only)
export const GET = withPermission({ 
  module: 'SELF_HELP', 
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
