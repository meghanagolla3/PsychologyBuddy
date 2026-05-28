import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import prisma from '@/src/prisma';

// GET /api/admin/locations/assigned - Get admin's assigned locations
export const GET = withPermission({ 
  module: 'USER_MANAGEMENT', 
  action: 'VIEW' 
})(async (req: NextRequest, ctx: any) => {
  try {
    const user = ctx.user;
    
    console.log('Fetching assigned locations for user:', {
      userId: user.id,
      userRole: user.role.name,
      userEmail: user.email
    });
    
    // Only ADMIN users can access their assigned locations
    if (user.role.name !== 'ADMIN') {
      console.log('User is not ADMIN, role:', user.role.name);
      return NextResponse.json(
        { success: false, message: 'Only ADMIN users can access their assigned locations' },
        { status: 403 }
      );
    }

    // Get the user's assigned location from the User model
    if (!user.locationId) {
      console.log('User has no location assigned');
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const location = await prisma.schoolLocation.findUnique({
      where: { id: user.locationId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
      }
    });

    const assignedLocations = location ? [{
      locationId: location.id,
      name: location.name,
      address: location.address,
      city: location.city
    }] : [];

    console.log('Found assigned locations:', assignedLocations);

    return NextResponse.json({
      success: true,
      data: assignedLocations
    });

  } catch (error) {
    console.error('Get assigned locations error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
