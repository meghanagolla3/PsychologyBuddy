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

    // Get admin's assigned location based on their locationId
    const assignedLocation = await prisma.schoolLocation.findFirst({
      where: { id: user.locationId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
      }
    });

    console.log('Found assigned location:', assignedLocation);

    return NextResponse.json({
      success: true,
      data: assignedLocation ? [{
        locationId: assignedLocation.id,
        name: assignedLocation.name,
        address: assignedLocation.address,
        city: assignedLocation.city
      }] : []
    });

  } catch (error) {
    console.error('Get assigned locations error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
