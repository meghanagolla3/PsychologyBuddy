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

    return counselors;
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

    return {
      ...counselor,
      escalationAlerts,
      counselingSessions,
      assignedStudents,
      activeEscalations: escalationAlerts,
      scheduledSessions: counselingSessions,
    };
  },

  // Update counselor
  updateCounselor: async (id: string, data: UpdateCounselorRequest) => {
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
        counselorProfile: {
          update: {
            ...(data.department && { department: data.department }),
            ...(data.specialization !== undefined && { specialization: data.specialization }),
            ...(data.availability !== undefined && { availability: data.availability }),
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
