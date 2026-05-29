import prisma from '../../../prisma';
import { CreateCounselorRequest, UpdateCounselorRequest } from './counselor.validators';

export const CounselorRepository = {
  // Create counselor with profile
  createCounselor: async (data: CreateCounselorRequest & { roleId: string; createdBy: string }) => {
    const result = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        roleId: data.roleId,
        schoolId: data.schoolId,
        locationId: data.locationId || null,
        status: data.status,
        emailVerified: true,
        counselorProfile: {
          create: {
            department: data.department,
          },
        },
      },
      include: {
        role: true,
        counselorProfile: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return result;
  },

  // Get all counselors with pagination and filtering
  getAllCounselors: async (schoolId?: string, locationId?: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const counselors = await prisma.user.findMany({
      where: {
        role: {
          name: 'COUNSELOR',
        },
        ...(schoolId && schoolId !== 'all' && { schoolId }),
        ...(locationId && locationId !== 'all' && { locationId }),
      },
      include: {
        role: true,
        counselorProfile: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Fetch session statistics for each counselor
    const counselorsWithStats = await Promise.all(
      counselors.map(async (counselor) => {
        // Get today's date start and end
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Count total completed sessions
        const totalCounsels = await prisma.counselingSession.count({
          where: {
            counselorId: counselor.id,
            status: 'COMPLETED',
          },
        });

        // Count today's completed sessions
        const todayCounsels = await prisma.counselingSession.count({
          where: {
            counselorId: counselor.id,
            status: 'COMPLETED',
            scheduledAt: {
              gte: today,
              lte: todayEnd,
            },
          },
        });

        // Count declined sessions (CANCELLED or MISSED)
        const declinedCounsels = await prisma.counselingSession.count({
          where: {
            counselorId: counselor.id,
            status: {
              in: ['CANCELLED', 'MISSED'],
            },
          },
        });

        return {
          ...counselor,
          sessionStats: {
            todayCounsels,
            totalCounsels,
            declinedCounsels,
          },
        };
      })
    );

    return counselorsWithStats;
  },

  // Get session history for a counselor
  getSessionHistory: async (counselorId: string, page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;

    const sessions = await prisma.counselingSession.findMany({
      where: {
        counselorId,
        status: {
          in: ['COMPLETED', 'CANCELLED', 'MISSED'],
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentId: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
      skip,
      take: limit,
    });

    const total = await prisma.counselingSession.count({
      where: {
        counselorId,
        status: {
          in: ['COMPLETED', 'CANCELLED', 'MISSED'],
        },
      },
    });

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  },

  // Get sessions for a specific date (for calendar)
  getSessionsByDate: async (counselorId: string, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await prisma.counselingSession.findMany({
      where: {
        counselorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    return sessions;
  },

  // Get all sessions for a month (for calendar markers)
  getSessionsByMonth: async (counselorId: string, year: number, month: number) => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const sessions = await prisma.counselingSession.findMany({
      where: {
        counselorId,
        scheduledAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
      },
    });

    return sessions;
  },

  // Get active escalation alerts for a counselor (challenges)
  getActiveChallenges: async (counselorId: string) => {
    const alerts = await prisma.escalationAlert.findMany({
      where: {
        assignedTo: counselorId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return alerts;
  },

  // Get wellness challenges for a counselor
  getWellnessChallenges: async (counselorId: string) => {
    // Get challenges created by the counselor
    const createdChallenges = await prisma.challenge.findMany({
      where: {
        createdBy: counselorId,
        isActive: true,
      },
      include: {
        userChallenges: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentId: true,
                classRef: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get challenges assigned to the counselor's students
    const counselor = await prisma.user.findUnique({
      where: { id: counselorId },
      include: {
        studentAssignments: {
          include: {
            student: true,
          },
        },
      },
    });

    const studentIds = counselor?.studentAssignments.map((assignment) => assignment.studentId) || [];

    const assignedChallenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        userChallenges: {
          some: {
            userId: { in: studentIds },
          },
        },
      },
      include: {
        userChallenges: {
          where: {
            userId: { in: studentIds },
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentId: true,
                classRef: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Combine and deduplicate challenges
    const allChallenges = [...createdChallenges, ...assignedChallenges];
    const uniqueChallenges = Array.from(
      new Map(allChallenges.map((c) => [c.id, c])).values()
    );

    // Transform to the expected format
    return uniqueChallenges.map((challenge) => {
      const students = challenge.userChallenges.map((uc) => ({
        id: uc.user.id,
        name: `${uc.user.firstName} ${uc.user.lastName}`,
        className: uc.user.classRef?.name || 'Unknown Class',
        status: uc.completedAt ? 'Completed' : 'In progress',
      }));

      const completedCount = students.filter((s) => s.status === 'Completed').length;
      const totalCount = students.length;
      const days = Math.ceil(
        (new Date(challenge.endsAt).getTime() - new Date(challenge.startsAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return {
        id: challenge.id,
        title: challenge.name,
        active: challenge.isActive,
        days,
        studentCount: totalCount,
        completionPct: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        start: challenge.startsAt.toISOString().split('T')[0],
        end: challenge.endsAt.toISOString().split('T')[0],
        completedRatio: `${completedCount}/${totalCount}`,
        students,
      };
    });
  },

  // Get counselor by ID
  getCounselorById: async (id: string) => {
    const counselor = await prisma.user.findUnique({
      where: {
        id,
        role: {
          name: 'COUNSELOR',
        },
      },
      include: {
        role: true,
        counselorProfile: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        // Include assigned students count
        counselorAssignments: {
          select: {
            id: true,
            studentId: true,
            assignedAt: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                studentId: true,
              }
            }
          },
        },
        // Include active escalations
        escalationAlerts: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
            studentId: true,
            level: true,
            category: true,
            createdAt: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        // Include scheduled sessions
        counselorCounselingSessions: {
          where: {
            status: 'SCHEDULED',
            scheduledAt: {
              gte: new Date(),
            },
          },
          select: {
            id: true,
            studentId: true,
            scheduledAt: true,
            status: true,
          },
          take: 10,
          orderBy: {
            scheduledAt: 'asc',
          },
        },
      },
    });

    if (!counselor) {
      return null;
    }

    // Transform escalation alerts to include student names
    const escalationAlerts = await Promise.all(
      counselor.escalationAlerts.map(async (alert) => {
        const student = await prisma.user.findUnique({
          where: { id: alert.studentId },
          select: { firstName: true, lastName: true }
        });
        
        return {
          ...alert,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'
        };
      })
    );

    // Transform counseling sessions to include student names
    const counselingSessions = await Promise.all(
      counselor.counselorCounselingSessions.map(async (session: any) => {
        const student = await prisma.user.findUnique({
          where: { id: session.studentId },
          select: { firstName: true, lastName: true }
        });
        
        return {
          ...session,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'
        };
      })
    );

    // Transform assigned students
    const assignedStudents = counselor.counselorAssignments.map(assignment => ({
      ...assignment,
      name: `${assignment.student.firstName} ${assignment.student.lastName}`
    }));

    // Calculate session statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const totalCounsels = await prisma.counselingSession.count({
      where: {
        counselorId: id,
        status: 'COMPLETED',
      },
    });

    const todayCounsels = await prisma.counselingSession.count({
      where: {
        counselorId: id,
        status: 'COMPLETED',
        scheduledAt: {
          gte: today,
          lte: todayEnd,
        },
      },
    });

    const declinedCounsels = await prisma.counselingSession.count({
      where: {
        counselorId: id,
        status: {
          in: ['CANCELLED', 'MISSED'],
        },
      },
    });

    return {
      ...counselor,
      escalationAlerts,
      counselingSessions,
      assignedStudents,
      activeEscalations: escalationAlerts,
      scheduledSessions: counselingSessions,
      sessionStats: {
        todayCounsels,
        totalCounsels,
        declinedCounsels,
      },
    };
  },

  // Update counselor
  updateCounselor: async (id: string, data: UpdateCounselorRequest) => {
    // Check if counselor profile exists
    const existingCounselor = await prisma.user.findUnique({
      where: { id },
      include: { counselorProfile: true },
    });

    if (!existingCounselor) {
      throw new Error('Counselor not found');
    }

    const counselorProfileData: any = {};
    if (data.department) counselorProfileData.department = data.department;
    if (data.specialization !== undefined) counselorProfileData.specialization = data.specialization;
    if (data.availability !== undefined) counselorProfileData.availability = data.availability;

    const updatedCounselor = await prisma.user.update({
      where: {
        id,
        role: {
          name: 'COUNSELOR',
        },
      },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.status && { status: data.status }),
        ...(data.schoolId && { schoolId: data.schoolId }),
        ...(data.locationId !== undefined && { locationId: data.locationId }),
        ...(Object.keys(counselorProfileData).length > 0 && {
          counselorProfile: existingCounselor.counselorProfile
            ? {
                update: counselorProfileData,
              }
            : {
                create: counselorProfileData,
              },
        }),
      },
      include: {
        role: true,
        counselorProfile: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedCounselor;
  },

  // Update counselor status
  updateCounselorStatus: async (id: string, status: string) => {
    const updatedCounselor = await prisma.user.update({
      where: {
        id,
        role: {
          name: 'COUNSELOR',
        },
      },
      data: {
        status,
      },
      include: {
        role: true,
        counselorProfile: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedCounselor;
  },

  // Delete counselor
  deleteCounselor: async (id: string) => {
    // First, delete related records
    await prisma.counselorNotification.deleteMany({
      where: {
        userId: id,
      },
    });

    await prisma.adminProfile.deleteMany({
      where: {
        userId: id,
      },
    });

    // Then delete the user
    const deletedCounselor = await prisma.user.delete({
      where: {
        id,
        role: {
          name: 'COUNSELOR',
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
    });

    return deletedCounselor;
  },

  // Get current assignments count for a counselor
  getCurrentAssignmentsCount: async (counselorId: string) => {
    const count = await prisma.counselorAssignment.count({
      where: {
        counselorId,
        status: 'ACTIVE'
      }
    });
    return count;
  },

  // Get existing assignments for a counselor and specific students
  // Note: status filter intentionally removed so we find any existing record,
  // preventing unique-constraint crashes on re-assignment.
  getExistingAssignments: async (counselorId: string, studentIds: string[]) => {
    const assignments = await prisma.counselorAssignment.findMany({
      where: {
        counselorId,
        studentId: {
          in: studentIds
        }
      },
      select: {
        id: true,
        studentId: true,
        counselorId: true,
        status: true
      }
    });
    return assignments;
  },

  // Create counselor assignments
  createAssignments: async (counselorId: string, studentIds: string[], assignedBy: string, level?: string, escalationAlertId?: string) => {
    const result = await prisma.counselorAssignment.createMany({
      data: studentIds.map(studentId => ({
        counselorId,
        studentId,
        escalationAlertId,
        assignedBy,
        level,
        status: 'ACTIVE'
      }))
    });
    return result;
  },

  // Update counselor's current student count - REMOVED: field doesn't exist in schema
  // updateCurrentStudentsCount: async (counselorId: string, count: number) => {
  //   await prisma.counselorProfile.update({
  //     where: {
  //       userId: counselorId
  //     },
  //     data: {
  //       currentStudents: count
  //     }
  //   });
  // },

  // Assign counselor to escalation alerts
  assignCounselorToAlerts: async (counselorId: string, studentIds: string[]) => {
    await prisma.escalationAlert.updateMany({
      where: {
        studentId: {
          in: studentIds
        },
        assignedTo: null // Only update unassigned alerts
      },
      data: {
        assignedTo: counselorId
      }
    });
  },
};

