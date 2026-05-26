import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/src/server/controllers/auth.controller';
import prisma from '@/src/prisma';

// POST - Parent cancels meeting
export const POST = async (req: NextRequest, { params }: any) => {
  try {
    // Get authenticated user
    const authResponse = await authController.me(req);
    const authData = await authResponse.json();
    
    if (!authData.success || !authData.data?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    const user = authData.data.user;
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

    // Get meeting details
    const meeting = await prisma.parentMeeting.findFirst({
      where: {
        id: id,
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

    // Verify this is a parent canceling their own student's meeting
    if (userInfo.role !== 'PARENT' || meeting.student.parentId !== userInfo.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Can only cancel your own meetings' },
        { status: 403 }
      );
    }

    // Update meeting status to CANCELLED
    const updatedMeeting = await prisma.parentMeeting.update({
      where: { id: id },
      data: {
        status: 'CANCELLED',
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

    // Create notification for the counselor
    try {
      await (prisma as any).counselorNotification.create({
        data: {
          userId: updatedMeeting.counselorId,
          type: 'session',
          message: `Meeting cancelled by parent: ${updatedMeeting.parentName} (for ${updatedMeeting.student.firstName})`,
          severity: 'medium',
          read: false
        }
      });
    } catch (notifError) {
      console.error('Failed to create counselor notification:', notifError);
    }

    // Create notification for the parent (cancellation receipt)
    try {
      await (prisma as any).parentNotification.create({
        data: {
          userId: meeting.student.parentId,
          type: 'meeting',
          title: 'Meeting Cancelled',
          message: `Your meeting with ${updatedMeeting.counselor.firstName} ${updatedMeeting.counselor.lastName} on ${new Date(updatedMeeting.date).toLocaleDateString()} at ${updatedMeeting.time} has been cancelled.`,
          severity: 'medium',
          meetingId: updatedMeeting.id,
          relatedUserId: updatedMeeting.studentId
        }
      });
    } catch (parentNotifError) {
      console.error('Failed to create parent notification:', parentNotifError);
    }
    
    return NextResponse.json({
      success: true,
      data: updatedMeeting,
      message: 'Meeting cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel meeting' },
      { status: 500 }
    );
  }
};
