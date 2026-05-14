import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/src/server/controllers/auth.controller';
import prisma from '@/src/prisma';

// POST - Parent confirms meeting
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

    // Verify this is a parent confirming their own student's meeting
    if (userInfo.role !== 'PARENT' || meeting.student.parentId !== userInfo.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Can only confirm your own meetings' },
        { status: 403 }
      );
    }

    // Update meeting status to SCHEDULED (confirmed)
    const updatedMeeting = await prisma.parentMeeting.update({
      where: { id: id },
      data: {
        status: 'SCHEDULED',
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
    
    return NextResponse.json({
      success: true,
      data: updatedMeeting,
      message: 'Meeting confirmed successfully',
    });
  } catch (error: any) {
    console.error('Confirm meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to confirm meeting' },
      { status: 500 }
    );
  }
};
