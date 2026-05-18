import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { StudentService } from '@/src/server/profiles/student/student.service';
import { CounselorService } from '@/src/server/profiles/counselor/counselor.service';
import { handleError } from '@/src/utils/errors';
import prisma from '@/src/prisma';

export const GET = withPermission({ 
  module: 'ESCALATIONS', 
  action: 'VIEW' 
})(async (req: NextRequest, { user }: any) => {
  try {
    // Ensure user is a counselor
    if (user.role.name !== 'COUNSELOR') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Counselors only.' },
        { status: 403 }
      );
    }

    // Get counselor's school ID - counselors should only see students from their assigned school
    const counselorSchoolId = user.schoolId;
    if (!counselorSchoolId) {
      return NextResponse.json(
        { success: false, message: 'Counselor is not assigned to a school.' },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const classId = searchParams.get('classId') || undefined;
    const locationId = searchParams.get('locationId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get students only from counselor's assigned school
    const result = await StudentService.getStudentsBySchool(
      counselorSchoolId, 
      { search, status, classId, locationId, page, limit }
    );

    // Additionally, filter to show only assigned students if counselor has specific assignments
    const counselorId = user.id;
    const assignedStudents = await prisma.counselorAssignment.findMany({
      where: {
        counselorId: counselorId
      },
      include: {
        student: {
          include: {
            classRef: true,
            school: true,
            location: true,
            escalationAlerts: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            studentCounselingSessions: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    // If counselor has specific assignments, show only those students
    // Otherwise, show all students from their school
    let filteredStudents = result.data?.students || [];
    if (assignedStudents.length > 0) {
      const assignedStudentIds = new Set(assignedStudents.map(a => a.studentId));
      filteredStudents = filteredStudents.filter((student: any) => 
        assignedStudentIds.has(student.id)
      );
    }

    // Transform students to include latest alert and session information
    const studentsWithSessionInfo = filteredStudents.map((student: any) => {
      const assignedStudent = assignedStudents.find(a => a.studentId === student.id);
      const latestAlert = assignedStudent?.student?.escalationAlerts?.[0];
      
      // Get session status from counselor assignment
      const sessionStatus = assignedStudent?.sessionStatus || 'none';
      
      return {
        ...student,
        latestAlertTime: latestAlert?.createdAt || null,
        alertStatus: latestAlert?.status || 'none',
        alertLevel: latestAlert?.level || 'none',
        alertId: latestAlert?.id || null,
        // Session information from counselor assignment
        sessionStatus: sessionStatus,
        sessionType: assignedStudent?.level || 'none', // Using level as session type
        sessionId: assignedStudent?.id || null,
        sessionScheduledAt: assignedStudent?.assignedAt || null
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        students: studentsWithSessionInfo,
        pagination: result.data?.pagination || {
          page,
          limit,
          total: studentsWithSessionInfo.length,
          totalPages: Math.ceil(studentsWithSessionInfo.length / limit),
          hasNext: false,
          hasPrev: page > 1,
        }
      },
      message: 'Students retrieved successfully'
    });

  } catch (error) {
    console.error('Get counselor students error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
