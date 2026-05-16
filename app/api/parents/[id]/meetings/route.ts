import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'USER_MANAGEMENT',
  action: 'VIEW',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;

    // Get children of this parent
    const children = await prisma.user.findMany({
      where: {
        parentId: id,
      },
      select: {
        id: true,
      },
    });

    const studentIds = children.map((child) => child.id);

    // Get all parent meetings for this parent's children
    const meetings = await prisma.parentMeeting.findMany({
      where: {
        studentId: {
          in: studentIds,
        },
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
          },
        }
      },
      orderBy: {
        date: 'desc',
      },
    });

    const formattedMeetings = meetings.map((meeting) => {
      const date = new Date(meeting.date);
      const dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const timeStr = meeting.time;

      return {
        id: meeting.id,
        title: meeting.purpose || "Meeting",
        meta: `with ${meeting.counselor.firstName} ${meeting.counselor.lastName} · ${dateStr} · ${timeStr} · Initiated by ${meeting.requestedBy === 'PARENT' ? 'parent' : 'Counsellor'}`,
        status: meeting.status === 'PENDING' ? 'Requested' :
                meeting.status === 'COMPLETED' ? 'Completed' :
                meeting.status === 'CANCELLED' ? 'Cancelled' : 'Declined',
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedMeetings,
      message: 'Meetings retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching parent meetings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
});
