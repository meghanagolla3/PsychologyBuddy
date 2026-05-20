import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    const parentId = user?.id;
    const schoolId = user?.schoolId;

    if (!parentId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Get parent info
    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      include: {
        parentProfile: true,
      }
    });

    // Get child info
    const child = await prisma.user.findFirst({
      where: { parentId: parentId, schoolId: schoolId },
      include: {
        classRef: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        parent: {
          firstName: parent?.firstName,
          lastName: parent?.lastName,
          email: parent?.email,
          phone: parent?.phone,
        },
        child: child ? {
          firstName: child.firstName,
          lastName: child.lastName,
          class: child.classRef ? `${child.classRef.grade}-${child.classRef.section}` : 'N/A'
        } : null
      }
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});
