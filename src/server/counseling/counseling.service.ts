import { CounselingRepository, CounselingSessionFilters, CreateSessionData, UpdateSessionData } from './counseling.repository';
import { SessionStatus } from '../../generated/prisma/client';
import { z } from 'zod';
import prisma from '../../prisma';

// Validation schemas
export const createSessionSchema = z.object({
  classId: z.string().optional(),
  section: z.string().optional(),
  studentId: z.string().min(1, 'Student is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  sessionType: z.string(),
  level: z.string().optional(),
  escalationId: z.string().optional(),
});

export const updateSessionSchema = z.object({
  notes: z.string().optional(),
  outcome: z.string().optional(),
  followUpNeeded: z.boolean().optional(),
  nextSessionAt: z.string().datetime().optional(),
});

export const startSessionSchema = z.object({});

export const completeSessionSchema = updateSessionSchema;

export const cancelSessionSchema = z.object({
  reason: z.string().optional(),
});

export class CounselingService {
  private repository = new CounselingRepository();

  // Create a new counseling session
  async createSession(userId: string, userSchoolId: string, data: z.infer<typeof createSessionSchema>) {
    // Parse date and time with robust formatting
    console.log('[CounselingService] Creating session with:', { date: data.date, time: data.time });
    
    // Ensure time has seconds (HH:mm:ss)
    const timeStr = data.time.includes(':') && data.time.split(':').length === 2 
      ? `${data.time}:00` 
      : data.time;
      
    const scheduledAt = new Date(`${data.date}T${timeStr}`);
    console.log('[CounselingService] Parsed scheduledAt:', scheduledAt.toISOString());
    
    // Validate scheduled time is in the future
    if (isNaN(scheduledAt.getTime())) {
      console.error('[CounselingService] Invalid date/time combination');
      throw new Error('Invalid date or time format');
    }

    if (scheduledAt <= new Date()) {
      console.error('[CounselingService] Past date error:', { scheduledAt, now: new Date() });
      throw new Error('Session must be scheduled for a future time');
    }

    // Check for scheduling conflicts
    const conflict = await this.repository.checkScheduleConflict(userId, scheduledAt);
    if (conflict) {
      throw new Error('You already have a session scheduled at this time');
    }

    // Create session data
    const sessionData: CreateSessionData = {
      schoolId: userSchoolId,
      studentId: data.studentId,
      counselorId: userId,
      escalationId: data.escalationId,
      classId: data.classId,
      section: data.section,
      sessionType: data.sessionType,
      level: data.level,
      scheduledAt,
    };

    return await this.repository.createSession(sessionData);
  }

  // Get sessions with filters and pagination
  async getSessions(
    userSchoolId: string | null,
    userId: string | null,
    userRole: string,
    filters: CounselingSessionFilters = {},
    page = 1,
    limit = 10
  ) {
    // Counselors can only see their own sessions
    if (userRole === 'COUNSELOR' && userId) {
      filters.counselorId = userId;
    }

    // Parents can only see sessions for their assigned student
    if (userRole === 'PARENT' && userId) {
      filters.studentId = userId;
    }

    return await this.repository.getSessions(userSchoolId, filters, page, limit);
  }

  // Get session details
  async getSessionById(sessionId: string, userSchoolId: string, userId: string, userRole: string) {
    const session = await this.repository.getSessionById(sessionId, userSchoolId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Check access permissions
    if (userRole === 'COUNSELOR' && session.counselorId !== userId) {
      throw new Error('Access denied');
    }

    if (userRole === 'STUDENT' && session.studentId !== userId) {
      throw new Error('Access denied');
    }

    if (userRole === 'PARENT' && session.studentId !== userId) {
      throw new Error('Access denied');
    }

    // Get previous sessions for context
    const previousSessions = await this.repository.getStudentPreviousSessions(
      session.studentId,
      userSchoolId
    );

    return {
      ...session,
      previousSessions,
    };
  }

  // Start a session
  async startSession(sessionId: string, userSchoolId: string, userId: string) {
    const session = await this.repository.getSessionById(sessionId, userSchoolId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.counselorId !== userId) {
      throw new Error('Only the assigned counselor can start this session');
    }

    if (session.status !== SessionStatus.SCHEDULED) {
      throw new Error('Session can only be started if it is scheduled');
    }

    // Time restriction removed for development - sessions can be started anytime
    // TODO: Add time restriction back for production if needed
    // const now = new Date();
    // const sessionTime = new Date(session.scheduledAt);
    // const earlyBuffer = 15 * 60 * 1000; // 15 minutes in milliseconds
    // if (now < new Date(sessionTime.getTime() - earlyBuffer)) {
    //   throw new Error('Session cannot be started yet');
    // }

    console.log(`[CounselingService] Starting session ${sessionId} for counselor ${userId}`);
    
    const startedSession = await this.repository.startSession(sessionId, userSchoolId, userId);
    console.log(`[CounselingService] Session updated in database:`, {
      id: startedSession.id,
      status: startedSession.status,
      startedAt: startedSession.startedAt
    });

    // Update session status in CounselorAssignment table
    console.log(`[CounselingService] Updating CounselorAssignment table for session ${sessionId}`);
    const { EscalationAlertService } = await import('../../services/escalations/escalation-alert-service');
    await EscalationAlertService.updateSessionStatusOnSessionStart(sessionId);
    console.log(`[CounselingService] CounselorAssignment table updated`);

    return startedSession;
  }

  // Complete a session
  async completeSession(
    sessionId: string,
    userSchoolId: string,
    userId: string,
    data: z.infer<typeof completeSessionSchema>
  ) {
    const session = await this.repository.getSessionById(sessionId, userSchoolId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.counselorId !== userId) {
      throw new Error('Only the assigned counselor can complete this session');
    }

    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new Error('Session can only be completed if it is in progress');
    }

    const updateData: UpdateSessionData = {
      notes: data.notes,
      outcome: data.outcome,
      followUpNeeded: data.followUpNeeded,
      nextSessionAt: data.nextSessionAt ? new Date(data.nextSessionAt) : undefined,
    };

    const completedSession = await this.repository.completeSession(sessionId, userSchoolId, userId, updateData);

    // Update escalation alerts when session is completed
    const { EscalationAlertService } = await import('../../services/escalations/escalation-alert-service');
    await EscalationAlertService.updateAlertStatusOnSessionCompletion(sessionId);

    // Update escalation status if linked
    if (session.escalationId && session.escalation && (session.escalation.status === 'open' || session.escalation.status === 'reviewed' || session.escalation.status === 'UNDER_REVIEW')) {
      // Mark as resolved when session is completed
      await this.updateEscalationStatus(session.escalationId, 'resolved');
    }

    return completedSession;
  }

  // Cancel a session
  async cancelSession(
    sessionId: string,
    userSchoolId: string,
    userId: string,
    data: z.infer<typeof cancelSessionSchema>
  ) {
    const session = await this.repository.getSessionById(sessionId, userSchoolId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.counselorId !== userId) {
      throw new Error('Only the assigned counselor can cancel this session');
    }

    if (session.status !== SessionStatus.SCHEDULED) {
      throw new Error('Only scheduled sessions can be cancelled');
    }

    return await this.repository.cancelSession(sessionId, userSchoolId, userId, data.reason);
  }

  // Update session (for admin edits)
  async updateSession(
    sessionId: string,
    userSchoolId: string,
    userId: string,
    userRole: string,
    data: z.infer<typeof updateSessionSchema>
  ) {
    const session = await this.repository.getSessionById(sessionId, userSchoolId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Only counselors can update their own sessions, admins can update any
    if (userRole === 'COUNSELOR' && session.counselorId !== userId) {
      throw new Error('Access denied');
    }

    const updateData: UpdateSessionData = {
      notes: data.notes,
      outcome: data.outcome,
      followUpNeeded: data.followUpNeeded,
      nextSessionAt: data.nextSessionAt ? new Date(data.nextSessionAt) : undefined,
    };

    return await this.repository.updateSession(sessionId, userSchoolId, updateData);
  }

  // Get session statistics
  async getSessionStats(userSchoolId: string) {
    return await this.repository.getSessionStats(userSchoolId);
  }

  // Helper: Update escalation status
  private async updateEscalationStatus(escalationId: string, status: string) {
    try {
      await prisma.escalationAlert.update({
        where: { id: escalationId },
        data: {
          status: status,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      // Don't throw error to avoid breaking session completion
    }
  }

  // Get sessions by status tabs
  async getSessionsByTab(
    tab: 'upcoming' | 'completed' | 'cancelled',
    userSchoolId: string,
    userId: string | null,
    userRole: string,
    filters: CounselingSessionFilters = {},
    page = 1,
    limit = 10
  ) {
    let statusFilters: SessionStatus[] = [];

    switch (tab) {
      case 'upcoming':
        statusFilters = [SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS];
        break;
      case 'completed':
        statusFilters = [SessionStatus.COMPLETED];
        break;
      case 'cancelled':
        statusFilters = [SessionStatus.CANCELLED, SessionStatus.MISSED];
        break;
    }

    filters.status = statusFilters;

    return await this.getSessions(userSchoolId, userId, userRole, filters, page, limit);
  }

  // Validate student belongs to counselor's school
  async validateStudentAccess(studentId: string, counselorSchoolId: string) {
    // This would typically check if the student is assigned to the counselor
    // or belongs to the same school
    // For now, we'll implement basic school validation
    return true; // Placeholder - implement proper validation
  }
}
