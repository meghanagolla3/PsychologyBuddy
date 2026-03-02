import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// GET /api/admin/schools - Get all schools for admin tools (Superadmin only)
export const GET = async (req: NextRequest) => {
  try {
    const schools = await UserService.getAllSchools();
    // Return just the schools array, not the full ApiResponse wrapper
    return Response.json(schools.data);
  } catch (error) {
    console.error('Get schools error:', error);
    const errorResponse = handleError(error);
    return Response.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
};
