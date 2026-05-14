import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// GET - Fetch all parent meetings for the counselor
export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
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

    // Fetch parent meetings for this counselor
    const meetings = await prisma.parentMeeting.findMany({
      where: {
        counselorId: userInfo.id,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            classRef: {
              select: {
                name: true,
              },
            },
            parent: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedMeetings = meetings.map((meeting: any) => ({
      id: meeting.id,
      student: {
        id: meeting.student.id,
        name: `${meeting.student.firstName} ${meeting.student.lastName}`,
        classGrade: meeting.student.classRef?.name || 'N/A',
        level: meeting.level,
        parentName: meeting.parentName,
        parentEmail: meeting.student.parent?.email || 'N/A',
      },
      date: meeting.date,
      time: meeting.time,
      purpose: meeting.purpose,
      notes: meeting.notes,
      status: meeting.status,
      requestedBy: meeting.requestedBy || 'COUNSELOR',
      createdAt: meeting.createdAt,
    }));

    console.log('Counselor API - Total meetings:', meetings.length);
    console.log('Counselor API - Parent requested meetings:', transformedMeetings.filter(m => m.requestedBy === 'PARENT'));
    console.log('Counselor API - Sample meeting:', transformedMeetings[0]);
    console.log('Counselor API - All requestedBy values:', meetings.map(m => ({ id: m.id, requestedBy: m.requestedBy })));

    return NextResponse.json({
      success: true,
      data: transformedMeetings,
    });
  } catch (error: any) {
    console.error('Fetch parent meetings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch parent meetings' },
      { status: 500 }
    );
  }
});

// POST - Create a new parent meeting
export const POST = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'CREATE',
})(async (req: NextRequest, { user }: any) => {
  try {
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
    const { studentId, studentName, classGrade, level, parentName, date, time, purpose } = body;

    if (!studentId || !date || !time || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create parent meeting
    const meeting = await prisma.parentMeeting.create({
      data: {
        counselorId: userInfo.id,
        studentId: studentId,
        parentName: parentName,
        date: new Date(date),
        time: time,
        purpose: purpose,
        level: level,
        status: 'PENDING',
        requestedBy: 'COUNSELOR',
        schoolId: userInfo.schoolId,
      } as any,
    });

    return NextResponse.json({
      success: true,
      data: meeting,
      message: 'Parent meeting scheduled successfully',
    });
  } catch (error: any) {
    console.error('Create parent meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create parent meeting' },
      { status: 500 }
    );
  }
});
