import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// PUT - Update meeting details
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
    
    if (!userInfo.id) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const isSuperAdmin = userInfo.role === 'SUPERADMIN';
    const isAdmin = userInfo.role === 'ADMIN' || userInfo.role === 'SCHOOL_SUPERADMIN';

    // Check if meeting exists and belongs to user's school
    const where: any = { id: id };
    if (!isSuperAdmin) {
      if (!userInfo.schoolId) {
        return NextResponse.json(
          { success: false, message: 'User not assigned to a school' },
          { status: 401 }
        );
      }
      where.schoolId = userInfo.schoolId;
      if (!isAdmin) {
        where.counselorId = userInfo.id;
      }
    }

    // Get meeting details
    const meeting = await prisma.parentMeeting.findFirst({
      where,
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
            classRef: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found or access denied' },
        { status: 404 }
      );
    }

    const body = await req.json();

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
            classRef: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    // Format the response to match frontend expectations
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

// GET - Get meeting details
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
    
    if (!userInfo.id) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const isSuperAdmin = userInfo.role === 'SUPERADMIN';
    const isAdmin = userInfo.role === 'ADMIN' || userInfo.role === 'SCHOOL_SUPERADMIN';

    // Check if meeting exists and belongs to user's school
    const where: any = { id: id };
    if (!isSuperAdmin) {
      if (!userInfo.schoolId) {
        return NextResponse.json(
          { success: false, message: 'User not assigned to a school' },
          { status: 401 }
        );
      }
      where.schoolId = userInfo.schoolId;
      if (!isAdmin) {
        where.counselorId = userInfo.id;
      }
    }

    // Get meeting details
    const meeting = await prisma.parentMeeting.findFirst({
      where,
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
            classRef: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found or access denied' },
        { status: 404 }
      );
    }

    // Format the response to match frontend expectations
    const formattedMeeting = {
      ...meeting,
      counselorName: `${meeting.counselor.firstName} ${meeting.counselor.lastName}`,
      counselorEmail: meeting.counselor.email,
      studentName: `${meeting.student.firstName} ${meeting.student.lastName}`,
      studentEmail: meeting.student.email,
      studentClass: meeting.student.classRef?.name || meeting.level || 'N/A',
      parentName: meeting.parentName,
      parentEmail: meeting.student.email,
      date: meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) : 'N/A',
    };
    
    return NextResponse.json({
      success: true,
      data: formattedMeeting,
      message: 'Meeting details retrieved successfully',
    });
  } catch (error: any) {
    console.error('Get meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve meeting details' },
      { status: 500 }
    );
  }
});
