import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;

    const meeting = await prisma.parentMeeting.findUnique({
      where: {
        id: id,
      },
      include: {
        counselor: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            classRef: {
              select: {
                grade: true,
                section: true,
              },
            },
          }
        },
        school: {
          select: {
            name: true,
          }
        }
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meeting,
      message: 'Meeting retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching meeting detail:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch meeting detail' },
      { status: 500 }
    );
  }
});
