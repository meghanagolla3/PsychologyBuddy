import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (request: NextRequest, { user }: any) => {
  console.log('[Alerts API] GET request received from user:', user.id);
  try {
    console.log('API: Fetching counselor assignments for user:', user.id, 'role:', user.role.name);
    
    // Ensure user is a counselor
    if (user.role.name !== 'COUNSELOR') {
      console.log('API: Access denied - user is not a counselor');
      return NextResponse.json(
        { success: false, message: 'Access denied. Counselors only.' },
        { status: 403 }
      );
    }

    // Get counselor's school ID
    const counselorSchoolId = user.schoolId;
    console.log('API: Counselor school ID:', counselorSchoolId);
    
    if (!counselorSchoolId) {
      console.log('API: Access denied - counselor has no schoolId');
      return NextResponse.json(
        { success: false, message: 'Counselor is not assigned to a school.' },
        { status: 400 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Get counselor assignments for this counselor
    const counselorAssignments = await prisma.counselorAssignment.findMany({
      where: {
        counselorId: user.id,
        status: 'ACTIVE'
      },
      include: {
        student: {
          include: {
            school: {
              select: { id: true, name: true }
            },
            classRef: {
              select: { id: true, name: true, grade: true, section: true }
            },
            parentProfile: {
              select: { 
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            parent: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            role: {
              select: { name: true }
            }
          }
        },
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format for the frontend
    const transformedAlerts = await Promise.all(counselorAssignments.map(async (assignment: any) => {
      const studentName = assignment.student?.firstName && assignment.student?.lastName 
        ? `${assignment.student.firstName} ${assignment.student.lastName}`
        : 'Unknown Student';
      
      const initials = studentName.split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      const classGrade = assignment.student?.classRef 
        ? assignment.student.classRef.name
        : 'Student';

      // Get session status - default to IN_PROGRESS waiting for scheduling
      let sessionStatus = 'IN_PROGRESS';
      let sessionType = 'INTAKE';
      let sessionId = null;
      let sessionScheduledAt = null;
      let alertStatus = 'active';
      let alertCreatedAt = assignment.createdAt;

      // Check if there's an escalation alert linked to this assignment
      if (assignment.escalationAlertId) {
        const alert = await prisma.escalationAlert.findUnique({
          where: { id: assignment.escalationAlertId },
          select: { status: true, createdAt: true }
        });
        if (alert) {
          if (alert.status === 'resolved') {
            alertStatus = 'completed';
          }
          if (alert.createdAt) {
            alertCreatedAt = alert.createdAt;
          }
        }
      }

      // Find the most recent counseling session for this student-counselor pair
      // Prefer the one linked to the current escalation alert, else fall back to most recent
      const existingSession = await prisma.counselingSession.findFirst({
        where: {
          studentId: assignment.studentId,
          counselorId: user.id,
          // Specifically match the escalation alert linked to this assignment if present
          ...(assignment.escalationAlertId && { escalationId: assignment.escalationAlertId }),
          status: { in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED'] }
        },
        orderBy: { scheduledAt: 'desc' }
      });

      if (existingSession) {
        sessionId = existingSession.id;
        sessionScheduledAt = existingSession.scheduledAt.toISOString().slice(0, 16).replace('T', ' ');

        if (alertStatus === 'completed') {
          // Session fully done
          sessionStatus = 'COMPLETED';
          sessionType = existingSession.sessionType;
        } else if (assignment.sessionStatus === 'PENDING' && existingSession.status === 'COMPLETED') {
          // A prior session completed but the new alert has no active session yet.
          // The NEXT session must be a FOLLOW_UP; show it as awaiting scheduling.
          sessionStatus = 'PENDING';
          sessionType = 'FOLLOW_UP';
          sessionId = null; // no active session yet for this alert
        } else {
          sessionStatus = existingSession.status;
          sessionType = existingSession.sessionType;
        }
      } else {
        // No session at all – determine correct type from student's overall history
        const hasAnyPriorSession = await prisma.counselingSession.findFirst({
          where: {
            studentId: assignment.studentId,
            status: 'COMPLETED'
          }
        });
        sessionType = hasAnyPriorSession ? 'FOLLOW_UP' : 'INTAKE';
        sessionStatus = 'PENDING';
      }

      // If there is an escalation alert but still no active session, mark as IN_PROGRESS
      // (waiting for counselor to schedule)
      if (assignment.escalationAlertId && !sessionId) {
        sessionStatus = sessionStatus === 'PENDING' ? 'PENDING' : 'IN_PROGRESS';
      }

      const transformedAlert = {
        id: assignment.studentId,
        escalationId: assignment.id,
        name: studentName,
        initials: initials,
        classGrade: classGrade,
        email: assignment.student?.email || 'No email',
        hasParentProfile: !!assignment.student?.parentProfile,
        hasParent: !!assignment.student?.parent,
        parentName: assignment.student?.parent 
          ? `${assignment.student.parent.firstName} ${assignment.student.parent.lastName}`
          : (assignment.student?.parentProfile?.user 
            ? `${assignment.student.parentProfile.user.firstName} ${assignment.student.parentProfile.user.lastName}`
            : null),
        status: assignment.status,
        createdAt: alertCreatedAt.toISOString(),
        alertTime: alertCreatedAt.toISOString(),
        timestamp: alertCreatedAt.toISOString(),
        alertStatus: alertStatus,
        alertLevel: assignment.level || 'medium',
        alertId: assignment.id,
        escalationAlertId: assignment.escalationAlertId,
        sessionStatus: sessionStatus,
        sessionType: sessionType,
        sessionId: sessionId,
        sessionScheduledAt: sessionScheduledAt || new Date().toISOString(),
        metadata: {
          escalationId: assignment.escalationAlertId || assignment.id,
          severity: assignment.level || 'medium',
          category: 'assignment',
          level: assignment.level || 'medium',
          timestamp: alertCreatedAt.toISOString(),
          createdAt: alertCreatedAt.toISOString(),
          assignedCounselor: assignment.counselor?.firstName 
            ? `${assignment.counselor.firstName} ${assignment.counselor.lastName}`
            : null,
          schoolName: assignment.student?.school?.name || 'Unknown School',
          studentId: assignment.studentId,
          assignmentLevel: assignment.level
        }
      };

      return transformedAlert;
    }));

    // Apply pagination after transformation
    const paginatedAlerts = transformedAlerts.slice(offset, offset + limit);
    
    // Get total count for pagination
    const total = transformedAlerts.length;

    return NextResponse.json({
      success: true,
      data: paginatedAlerts,
      total: total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('API Error fetching counselor assignments:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

