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

    let assignedLocations: Array<{ locationId: string; name: string; address: string | null; city: string | null }> = [];

    const prismaClient = prisma as any;
    if (prismaClient.locationAdminAssignment) {
      const assignments = await prismaClient.locationAdminAssignment.findMany({
        where: { adminId: user.id },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
            }
          }
        }
      });
      assignedLocations = assignments.map((a: any) => ({
        locationId: a.locationId,
        name: a.location.name,
        address: a.location.address,
        city: a.location.city
      }));
    } else {
      console.log('locationAdminAssignment model not found on prisma client, attempting raw postgres query fallback...');
      try {
        const rawAssignments = await prisma.$queryRaw<any[]>`
          SELECT 
            la."locationId",
            sl.name as "locationName",
            sl.address as "locationAddress",
            sl.city as "locationCity"
          FROM "LocationAdminAssignments" la
          JOIN "SchoolLocations" sl ON la."locationId" = sl.id
          WHERE la."adminId" = ${user.id}
        `;
        assignedLocations = rawAssignments.map((a: any) => ({
          locationId: a.locationId,
          name: a.locationName,
          address: a.locationAddress,
          city: a.locationCity
        }));
      } catch (rawError) {
        console.error('Raw fallback query failed for location assignments:', rawError);
        assignedLocations = [];
      }
    }

    console.log('Found assigned locations:', assignedLocations.length);
    console.log('Location assignments:', assignedLocations);

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
