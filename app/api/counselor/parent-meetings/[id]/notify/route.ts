import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// POST - Notify parent when meeting starts
export const POST = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'UPDATE',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    const userInfo = {
      id: user?.id,
      role: user?.role?.name,
      schoolId: user?.schoolId,
    };
    
    if (!userInfo.id || !userInfo.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    // Get meeting details with parent and student info
    const meeting = await prisma.parentMeeting.findFirst({
      where: {
        id: id,
        counselorId: userInfo.id,
        schoolId: userInfo.schoolId,
      },
      include: {
        student: {
          include: {
            parent: true
          }
        },
        counselor: true
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Update meeting status to IN_PROGRESS
    const updatedMeeting = await prisma.parentMeeting.update({
      where: { id: id },
      data: {
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
      include: {
        student: {
          include: {
            parent: true
          }
        },
        counselor: true
      }
    });

    // TODO: Send real-time notification to parent
    // For now, the parent side will see the status change when they refresh
    // In a real implementation, you would use WebSockets or Server-Sent Events
    
    return NextResponse.json({
      success: true,
      data: updatedMeeting,
      message: 'Meeting started and parent notified',
    });
  } catch (error: any) {
    console.error('Notify parent meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to notify parent' },
      { status: 500 }
    );
  }
});
