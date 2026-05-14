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

    // Validate required fields
    if (!studentId || !date || !time || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: studentId, date, time, purpose' },
        { status: 400 }
      );
    }
    
    const userInfo = {
      id: user?.id,
      role: user?.role?.name,
      schoolId: user?.schoolId,
    };
    
    console.log('Parent meeting request:', { userInfo, studentId, date, time, purpose });
    
    if (!userInfo.id || !userInfo.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!studentId || !date || !time || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: studentId, date, time, purpose' },
        { status: 400 }
      );
    }

    // Verify the student belongs to this parent
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        parentId: userInfo.id,
        schoolId: userInfo.schoolId,
      },
      include: {
        parent: true
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found or not associated with this parent' },
        { status: 404 }
      );
    }

    // Find a counselor for this school (for now, assign first available counselor)
    const counselor = await prisma.user.findFirst({
      where: {
        schoolId: userInfo.schoolId,
        role: {
          name: 'COUNSELOR'
        }
      }
    });

    if (!counselor) {
      return NextResponse.json(
        { success: false, message: 'No counselor available for this school' },
        { status: 404 }
      );
    }

    // Create the meeting request
    console.log('Creating parent meeting request:', {
      studentId,
      date,
      time,
      purpose,
      level,
      counselorId: counselor.id,
      schoolId: userInfo.schoolId
    });

    const meeting = await prisma.parentMeeting.create({
      data: {
        counselorId: counselor.id,
        studentId: studentId,
        parentName: student.parent?.firstName + ' ' + student.parent?.lastName || 'Unknown Parent',
        date: new Date(date),
        time: time,
        purpose: purpose,
        level: level || 'medium',
        status: 'PENDING',
        requestedBy: 'PARENT',
        schoolId: userInfo.schoolId,
      } as any,
      include: {
        student: {
          include: {
            parent: true
          }
        },
        counselor: true
      }
    });

    console.log('Parent meeting request created:', meeting.id);
    console.log('Full meeting object:', JSON.stringify(meeting, null, 2));

    return NextResponse.json({
      success: true,
      data: meeting,
      message: 'Meeting request submitted successfully'
    });

  } catch (error: any) {
    console.error('Parent meeting request error:', error);
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
