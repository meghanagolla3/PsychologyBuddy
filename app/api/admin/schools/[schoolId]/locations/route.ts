import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// GET /api/admin/schools/[schoolId]/locations - Get all locations for a specific school
export const GET = withPermission({ 
  module: 'ORGANIZATIONS', 
  action: 'VIEW' 
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { schoolId } = await params;
    console.log('Fetching locations for school:', schoolId);
    
    // Get locations for the specific school
    const locations = await UserService.getSchoolLocations(schoolId);
    
    return Response.json({
      success: true,
      locations: (locations as any).data || []
    });
  } catch (error) {
    console.error('Get school locations error:', error);
    const errorResponse = handleError(error);
    return Response.json({
      success: false,
      error: errorResponse.error?.message || 'Failed to fetch school locations'
    }, { status: errorResponse.error?.code || 500 });
  }
});

// POST /api/admin/schools/[schoolId]/locations - Create a new location for a school
export const POST = withPermission({ 
  module: 'ORGANIZATIONS', 
  action: 'CREATE' 
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { schoolId } = await params;
    const body = await req.json();
    const { name } = body;
    
    console.log('Creating location for school:', schoolId, 'with name:', name);
    
    if (!name || !name.trim()) {
      return Response.json({
        success: false,
        error: 'Location name is required'
      }, { status: 400 });
    }
    
    // Create the location
    const location = await UserService.createSchoolLocation(schoolId, name.trim());
    
    return Response.json({
      success: true,
      location: (location as any).data
    });
  } catch (error) {
    console.error('Create school location error:', error);
    const errorResponse = handleError(error);
    return Response.json({
      success: false,
      error: errorResponse.error?.message || 'Failed to create school location'
    }, { status: errorResponse.error?.code || 500 });
  }
});
