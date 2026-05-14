import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
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

    // Get meeting details
    const meeting = await prisma.parentMeeting.findFirst({
      where: {
        id: id,
        studentId: userInfo.id,
        schoolId: userInfo.schoolId,
      },
      include: {
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedMeeting = {
      ...meeting,
      counselorName: `${meeting.counselor.firstName} ${meeting.counselor.lastName}`,
      counselorEmail: meeting.counselor.email,
      studentName: `${meeting.student.firstName} ${meeting.student.lastName}`,
      studentEmail: meeting.student.email,
    };
    
    return NextResponse.json({
      success: true,
      data: formattedMeeting,
      message: 'Meeting details retrieved successfully',
    });
  } catch (error: any) {
    console.error('Get meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get meeting details' },
      { status: 500 }
    );
  }
});

export const PUT = withPermission({
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

    const body = await req.json();

    // Get meeting details
    const meeting = await prisma.parentMeeting.findFirst({
      where: {
        id: id,
        studentId: userInfo.id,
        schoolId: userInfo.schoolId,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Update meeting with new details
    const updatedMeeting = await prisma.parentMeeting.update({
      where: { id: id },
      data: {
        purpose: body.purpose || meeting.purpose,
        discussion: body.discussion || meeting.discussion,
        recommendations: body.recommendations || meeting.recommendations,
        notes: body.notes || meeting.notes,
        updatedAt: new Date(),
      },
      include: {
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Format response
    const formattedMeeting = {
      ...updatedMeeting,
      counselorName: `${updatedMeeting.counselor.firstName} ${updatedMeeting.counselor.lastName}`,
      counselorEmail: updatedMeeting.counselor.email,
      studentName: `${updatedMeeting.student.firstName} ${updatedMeeting.student.lastName}`,
      studentEmail: updatedMeeting.student.email,
    };
    
    return NextResponse.json({
      success: true,
      data: formattedMeeting,
      message: 'Meeting details updated successfully',
    });
  } catch (error: any) {
    console.error('Update meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update meeting details' },
      { status: 500 }
    );
  }
});
