import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (user.role.name !== 'SUPER_ADMIN' && user.schoolId) {
      whereClause.schoolId = user.schoolId;
    }

    const [meetings, total] = await Promise.all([
      prisma.parentMeeting.findMany({
        where: whereClause,
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
        skip,
        take: limit,
      }),
      prisma.parentMeeting.count({ where: whereClause }),
    ]);

    const formattedMeetings = meetings.map((meeting) => ({
      id: meeting.id,
      purpose: meeting.purpose,
      parentName: meeting.parentName,
      counselorName: `${meeting.counselor.firstName} ${meeting.counselor.lastName}`,
      studentName: `${meeting.student.firstName} ${meeting.student.lastName}`,
      studentClass: meeting.student.classRef ? `Class ${meeting.student.classRef.grade}-${meeting.student.classRef.section}` : undefined,
      parentEmail: undefined, 
      parentPhone: undefined, 
      date: meeting.date,
      time: meeting.time,
      status: meeting.status,
      requestedBy: meeting.requestedBy,
      schoolName: meeting.school?.name || 'Unknown School',
    }));

    return NextResponse.json({
      success: true,
      data: formattedMeetings,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
      },
      message: 'Meetings retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching parent meetings:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
});
