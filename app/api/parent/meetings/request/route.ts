import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// POST - Parent requests a meeting
export const POST = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'CREATE',
})(async (req: NextRequest, { user }: any) => {
  try {
    const body = await req.json();
    const { studentId, date, time, purpose, level } = body;

    console.log('[ParentMeetingRequest] Received request:', { studentId, date, time, purpose, level });

    // Validate required fields
    if (!studentId || !date || !time || !purpose) {
      console.error('[ParentMeetingRequest] Missing fields');
      return NextResponse.json(
        { success: false, message: 'Missing required fields: studentId, date, time, purpose' },
        { status: 400 }
      );
    }
    
    const parentId = user?.id;
    let schoolId = user?.schoolId;
    
    if (!parentId) {
      console.error('[ParentMeetingRequest] User not authenticated');
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Find student and verify parent relationship
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        parentId: parentId,
      },
      include: {
        parent: true
      }
    });

    if (!student) {
      console.error('[ParentMeetingRequest] Student not found or not associated with this parent:', { studentId, parentId });
      return NextResponse.json(
        { success: false, message: 'Student not found or not associated with this parent' },
        { status: 404 }
      );
    }

    // If parent doesn't have schoolId, use student's schoolId
    if (!schoolId) {
      schoolId = student.schoolId;
    }

    if (!schoolId) {
      console.error('[ParentMeetingRequest] School ID not found for parent or student');
      return NextResponse.json(
        { success: false, message: 'School ID not found' },
        { status: 400 }
      );
    }

    // Find a counselor for this school
    const counselor = await prisma.user.findFirst({
      where: {
        schoolId: schoolId,
        role: {
          name: 'COUNSELOR'
        }
      }
    });

    if (!counselor) {
      console.error('[ParentMeetingRequest] No counselor available for school:', schoolId);
      return NextResponse.json(
        { success: false, message: 'No counselor available for this school' },
        { status: 404 }
      );
    }

    // Create the meeting request
    const meeting = await prisma.parentMeeting.create({
      data: {
        counselorId: counselor.id,
        studentId: studentId,
        parentName: student.parent ? `${student.parent.firstName} ${student.parent.lastName}` : 'Parent',
        date: new Date(date),
        time: time,
        purpose: purpose,
        level: level || 'medium',
        status: 'PENDING',
        requestedBy: 'PARENT',
        schoolId: schoolId,
      } as any,
      include: {
        student: true,
        counselor: true
      }
    });

    console.log('[ParentMeetingRequest] Created meeting:', meeting.id);

    // Create notification for the counselor
    try {
      await prisma.counselorNotification.create({
        data: {
          userId: counselor.id,
          type: 'session',
          message: `New meeting request from parent: ${meeting.parentName} (for ${student.firstName})`,
          severity: 'medium',
          read: false
        }
      });
      console.log('[ParentMeetingRequest] Counselor notification created');
    } catch (notifError) {
      console.error('[ParentMeetingRequest] Failed to create counselor notification:', notifError);
    }

    // Create notification for school admins
    try {
      const admins = await prisma.user.findMany({
        where: {
          schoolId: schoolId,
          role: {
            name: { in: ['ADMIN', 'SUPERADMIN'] }
          }
        }
      });

      if (admins.length > 0) {
        await Promise.all(admins.map(admin => 
          prisma.adminNotification.create({
            data: {
              userId: admin.id,
              type: 'system',
              message: `Meeting request: ${meeting.parentName} requested a meeting for ${student.firstName}`,
              severity: 'medium',
              read: false
            }
          })
        ));
        console.log(`[ParentMeetingRequest] ${admins.length} Admin notifications created`);
      }
    } catch (adminNotifError) {
      console.error('[ParentMeetingRequest] Failed to create admin notifications:', adminNotifError);
    }

    return NextResponse.json({
      success: true,
      data: meeting,
      message: 'Meeting request submitted successfully'
    });

  } catch (error: any) {
    console.error('[ParentMeetingRequest] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit meeting request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});
