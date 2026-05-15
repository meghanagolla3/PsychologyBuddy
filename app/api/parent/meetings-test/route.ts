import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// GET - Get parent meetings (filtered by authenticated parent)
export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    console.log('=== Parent Meetings Test API Called ===');
    
    const userInfo = {
      id: user?.id,
      role: user?.role?.name,
      schoolId: user?.schoolId,
    };
    
    console.log('Authenticated user:', userInfo);
    
    if (!userInfo.id || !userInfo.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }
    
    // Fetch meetings only for this parent's children
    const meetings = await prisma.parentMeeting.findMany({
      where: {
        student: {
          parentId: userInfo.id,
          schoolId: userInfo.schoolId,
        },
        schoolId: userInfo.schoolId,
      },
      include: {
        student: {
          include: {
            parent: true,
            classRef: true
          }
        },
        counselor: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${meetings.length} meetings for parent ${userInfo.id}`);

    // Transform data for frontend
    const transformedMeetings = meetings.map(meeting => ({
      id: meeting.id,
      studentId: meeting.studentId,
      studentName: meeting.student.firstName + ' ' + meeting.student.lastName,
      studentEmail: meeting.student.email,
      counselorName: meeting.counselor.firstName + ' ' + meeting.counselor.lastName,
      counselorEmail: meeting.counselor.email,
      date: meeting.date,
      time: meeting.time,
      purpose: meeting.purpose,
      level: meeting.level || 'medium',
      status: meeting.status,
      parentName: meeting.student.parent?.name || 'Unknown Parent',
      parentId: meeting.student.parentId,
      studentClassGrade: meeting.student.classRef?.name || '',
      requestedBy: meeting.requestedBy || 'COUNSELOR',
      notes: meeting.notes,
      discussion: meeting.discussion,
      recommendations: meeting.recommendations,
      createdAt: meeting.createdAt.toISOString(),
      updatedAt: meeting.updatedAt.toISOString()
    }));

    console.log('Sample meeting for this parent:', transformedMeetings[0]);
    console.log('Meeting statuses:', transformedMeetings.map(m => ({ id: m.id, status: m.status, student: m.studentName })));

    return NextResponse.json({
      success: true,
      data: transformedMeetings,
      message: `Retrieved ${transformedMeetings.length} meetings for parent`
    });

  } catch (error) {
    console.error('Parent meetings test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve parent meetings',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});
