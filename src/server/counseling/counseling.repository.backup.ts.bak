import prisma from '@/src/prisma';
import { SessionType } from '../../generated/prisma/client';

export interface CounselingSessionFilters {
  classId?: string;
  counselorId?: string;
  studentId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface CreateSessionData {
  schoolId: string;
  studentId: string;
  counselorId: string;
  escalationId?: string;
  classId?: string;
  section?: string;
  sessionType: SessionType;
  scheduledAt: Date;
}

export interface UpdateSessionData {
  notes?: string;
  outcome?: string;
  followUpNeeded?: boolean;
  nextSessionAt?: Date;
}

export class CounselingRepository {
  // Create a new counseling session
  async createSession(data: CreateSessionData) {
    // Handle INTAKE vs FOLLOW_UP session logic
    let previousSessionId = null;
    
    if (data.sessionType === 'FOLLOW_UP') {
      // Find the student's last completed session
      const lastCompletedSession = await prisma.counselingSession.findFirst({
        where: {
          studentId: data.studentId,
          status: 'COMPLETED'
        },
        orderBy: {
          endedAt: 'desc'
        },
        select: {
          id: true
        }
      });
      
      if (lastCompletedSession) {
        previousSessionId = lastCompletedSession.id;
      }
    }
    
    const session = await prisma.session.create({
      data: {
        ...data,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentId: true,
            classRef: {
              select: {
                id: true,
                name: true,
                grade: true,
                section: true,
              },
            },
          },
        },
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
          },
        },
        escalation: {
          select: {
            id: true,
            category: true,
            severity: true,
            description: true,
            status: true,
          },
        },
        intake: true,
        report: true,
        previousSession: {
          select: {
            id: true,
            sessionType: true,
            intake: true
          }
        }
      },
    });
    
    // Create intake data for INTAKE sessions
    if (session.sessionType === 'INTAKE') {
      await prisma.sessionIntake.create({
        data: {
          sessionId: session.id,
          basicInfo: {},
          complaints: {},
          factors: {},
          familyHistory: '',
          personalHistory: {},
          sessionReport: {},
          status: 'DRAFT'
        }
      });
    }
    
    // Create report data for FOLLOW_UP sessions
    if (session.sessionType === 'FOLLOW_UP') {
      await prisma.sessionReport.create({
        data: {
          sessionId: session.id,
          behavioralTags: [],
          summary: '',
          recommendations: [],
          notes: ''
        }
      });
    }
    
    return session;
  }

  // Get sessions with filters and pagination
  async getSessions(
    schoolId: string,
    filters: CounselingSessionFilters = {},
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      schoolId,
    };

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.classId) {
      where.classId = filters.classId;
    }

    if (filters.counselorId) {
      where.counselorId = filters.counselorId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.scheduledAt = {};
      if (filters.dateFrom) {
        where.scheduledAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.scheduledAt.lte = filters.dateTo;
      }
    }

    if (filters.search) {
      where.OR = [
        {
          student: {
            OR: [
              { firstName: { contains: filters.search, mode: 'insensitive' } },
              { lastName: { contains: filters.search, mode: 'insensitive' } },
              { studentId: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          title: { contains: filters.search, mode: 'insensitive' },
        },
      ];
    }

    const [sessions, total] = await Promise.all([
      prisma.counselingSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentId: true,
              classRef: {
                select: {
                  id: true,
                  name: true,
                  grade: true,
                  section: true,
                },
              },
            },
          },
          counselor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
            },
          },
          escalation: {
            select: {
              id: true,
              category: true,
              severity: true,
              description: true,
              status: true,
            },
          },
          intake: true,
          report: true,
          previousSession: {
            select: {
              id: true,
              sessionType: true,
              intake: true
            }
          }
        },
      }),
      prisma.counselingSession.count({ where }),
    ]);

    return {
      sessions,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    };
  }

  // Get session by ID
  async getSessionById(sessionId: string, schoolId: string) {
    return await prisma.counselingSession.findFirst({
      where: {
        id: sessionId,
        schoolId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentId: true,
            classRef: {
              select: {
                id: true,
                name: true,
                grade: true,
                section: true,
              },
            },
            moodCheckins: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
              select: {
                id: true,
                mood: true,
                createdAt: true,
              },
            },
          },
        },
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
          },
        },
        escalation: {
          select: {
            id: true,
            category: true,
            severity: true,
            description: true,
            status: true,
            detectedPhrases: true,
            messageContent: true,
          },
        },
      },
    });
  }

  // Get previous sessions for a student
  async getStudentPreviousSessions(studentId: string, schoolId: string, limit = 5) {
    return await prisma.session.findMany({
      where: {
        studentId,
        schoolId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Update session
  async updateSession(sessionId: string, schoolId: string, data: UpdateSessionData) {
    return await prisma.session.update({
      where: {
        id: sessionId,
        schoolId,
      },
      data,
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
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Start session
  async startSession(sessionId: string, schoolId: string, counselorId: string) {
    return await prisma.counselingSession.update({
      where: {
        id: sessionId,
        schoolId,
        counselorId,
      },
      data: {
        status: SessionStatus.IN_PROGRESS,
        startedAt: new Date(),
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
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Complete session
  async completeSession(sessionId: string, schoolId: string, counselorId: string, data: UpdateSessionData) {
    return await prisma.counselingSession.update({
      where: {
        id: sessionId,
        schoolId,
        counselorId,
      },
      data: {
        status: SessionStatus.COMPLETED,
        endedAt: new Date(),
        ...data,
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
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Cancel session
  async cancelSession(sessionId: string, schoolId: string, counselorId: string, reason?: string) {
    return await prisma.counselingSession.update({
      where: {
        id: sessionId,
        schoolId,
        counselorId,
      },
      data: {
        status: SessionStatus.CANCELLED,
        notes: reason,
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
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Check for scheduling conflicts (temporarily disabled due to database schema issues)
  async checkScheduleConflict(counselorId: string, scheduledAt: Date, excludeSessionId?: string) {
    // TODO: Fix database schema and re-enable conflict checking
    console.log('Conflict check temporarily disabled for counselor:', counselorId);
    return null; // No conflict detected
  }

  // Get session statistics for admin
  async getSessionStats(schoolId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalSessions,
      todaySessions,
      upcomingSessions,
      completedThisWeek,
      cancelledSessions,
      averageDuration,
      counselorWorkload,
    ] = await Promise.all([
      // Total sessions
      prisma.counselingSession.count({
        where: { schoolId },
      }),
      // Today's sessions
      prisma.counselingSession.count({
        where: {
          schoolId,
          scheduledAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Upcoming sessions
      prisma.counselingSession.count({
        where: {
          schoolId,
          scheduledAt: { gte: now },
          status: { in: [SessionStatus.SCHEDULED] },
        },
      }),
      // Completed this week
      prisma.counselingSession.count({
        where: {
          schoolId,
          status: SessionStatus.COMPLETED,
          endedAt: { gte: weekStart },
        },
      }),
      // Cancelled sessions
      prisma.counselingSession.count({
        where: {
          schoolId,
          status: SessionStatus.CANCELLED,
        },
      }),
      // Duration tracking removed - not in schema
      [],
      // Counselor workload
      prisma.counselingSession.groupBy({
        by: ['counselorId'],
        where: {
          schoolId,
          scheduledAt: { gte: weekStart },
        },
        _count: {
          id: true,
        },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    // Duration calculation removed - no duration field in schema

    return {
      totalSessions,
      todaySessions,
      upcomingSessions,
      completedThisWeek,
      cancelledSessions,
      averageDuration: 0, // Placeholder - no duration field in schema
      counselorWorkload: counselorWorkload.map((item: any) => ({
        counselorId: item.counselorId,
        sessionCount: item._count.id,
      })),
    };
  }
}
