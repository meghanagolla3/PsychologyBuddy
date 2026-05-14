import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'ADMIN',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    let meetings;

    // Check user role and schoolId to determine scope
    if (user.role.name === 'SUPER_ADMIN' || !user.schoolId) {
      // Super Admin or users without school can see all meetings across all schools
      meetings = await prisma.parentMeeting.findMany({
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
                }
              }
            }
          },
          school: {
            select: {
              name: true,
            }
          }
        },
        orderBy: {
          date: 'desc',
        },
      });
    } else {
      // School Super Admin and Admin can only see meetings from their school
      meetings = await prisma.parentMeeting.findMany({
        where: {
          schoolId: user.schoolId,
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
                }
              }
            }
          },
          school: {
            select: {
              name: true,
            }
          }
        },
        orderBy: {
          date: 'desc',
        },
      });
    }

    const formattedMeetings = meetings.map((meeting) => ({
      id: meeting.id,
      purpose: meeting.purpose,
      parentName: meeting.parentName,
      counselorName: `${meeting.counselor.firstName} ${meeting.counselor.lastName}`,
      studentName: `${meeting.student.firstName} ${meeting.student.lastName}`,
      studentClass: meeting.student.classRef ? `Class ${meeting.student.classRef.grade}-${meeting.student.classRef.section}` : undefined,
      parentEmail: undefined, // Not available in ParentMeeting model
      parentPhone: undefined, // Not available in ParentMeeting model
      date: meeting.date,
      time: meeting.time,
      status: meeting.status,
      requestedBy: meeting.requestedBy,
      schoolName: meeting.school?.name || 'Unknown School',
    }));

    return NextResponse.json({
      success: true,
      data: formattedMeetings,
      message: 'Meetings retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching parent meetings:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
});
