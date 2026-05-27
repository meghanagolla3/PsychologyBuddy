import { EscalationDetection, EscalationAlert } from './content-escalation-detector'

import { BehavioralEscalationDetector } from './behavioral-escalation-detector'

import prisma from '../../prisma'



export interface NotificationChannel {

  type: 'email' | 'sms' | 'in_app' | 'webhook'

  enabled: boolean

  config: Record<string, any>

}



export interface EscalationNotification {

  alertId: string

  channels: NotificationChannel[]

  message: string

  severity: 'low' | 'medium' | 'high' | 'critical'

  recipients: string[]

  sentAt?: string

  status: 'pending' | 'sent' | 'failed'

}



export interface AdminNotification {

  id: string

  adminId: string

  alertId: string

  type: 'escalation' | 'resolution' | 'update'

  message: string

  severity: 'low' | 'medium' | 'high' | 'critical'

  read: boolean

  createdAt: string

  readAt?: string

}



export class EscalationAlertService {

  /**

   * Gets student name for display

   */

  private static async getStudentName(studentId: string): Promise<string> {

    try {

      const user = await prisma.user.findFirst({

        where: {

          OR: [

            { id: studentId },

            { studentId: studentId }

          ]

        },

        select: { firstName: true, lastName: true }

      });

      

      return user ? `${user.firstName} ${user.lastName}` : 'Unknown Student';

    } catch (error) {

      console.error('[EscalationAlert] Failed to get student name:', error);

      return 'Unknown Student';

    }

  }



  /**

   * Gets student class for display

   */

  private static async getStudentClass(studentId: string): Promise<string | null> {

    try {

      const user = await prisma.user.findFirst({

        where: {

          OR: [

            { id: studentId },

            { studentId: studentId }

          ]

        },

        select: { 

          classRef: {

            select: { 

              name: true,

              grade: true,

              section: true

            }

          }

        }

      });

      

      if (user?.classRef) {

        return `Class ${user.classRef.grade}${user.classRef.section ? `-${user.classRef.section}` : ''}`;

      }

      

      return null;

    } catch (error) {

      console.error('[EscalationAlert] Failed to get student class:', error);

      return null;

    }

  }



  /**

   * Generates alert description for display using AI

   */

  private static async generateAlertDescription(detection: EscalationDetection): Promise<string> {

    const { category, detectedPhrases, context } = detection;

    

    // For behavioral alerts, use contextual descriptions

    if (category.type === 'check_in_missed' || category.type === 'mood_trend_decline') {

      switch (category.type) {

        case 'check_in_missed':

          return 'Check-in compliance issues detected. Student has missed scheduled wellness check-ins and may need outreach support.';

        case 'mood_trend_decline':

          return 'Mood decline indicators detected in check-ins. Student reported worsening emotional state over time.';

      }

    }

    

    // For content-based escalations, generate AI-powered contextual summary

    return this.generateContextualSummary(detection);

  }



  /**

   * Generates AI-powered contextual summary based on student's actual message

   */

  private static async generateContextualSummary(detection: EscalationDetection): Promise<string> {

    const { category, detectedPhrases, context } = detection;

    

    // Use AI to generate a dynamic, contextual summary

    return this.generateAISummary(detection);

  }



  /**

   * Uses AI to generate dynamic, personalized alert summaries

   */

  private static async generateAISummary(detection: EscalationDetection): Promise<string> {

    try {

      const { category, detectedPhrases, context } = detection;

      

      // Create a prompt for the AI to generate a contextual summary

      const prompt = `You are a school mental health professional analyzing a student's message for escalation alerts. 



Student's message: "${context}"



Detected concern category: ${category.type.replace('_', ' ')}

Trigger phrases: ${detectedPhrases.join(', ')}



Generate a concise, professional 2-sentence alert summary that:

1. Identifies the type of concern detected

2. Briefly explains how the student expressed their feelings in their own words

3. Indicates the level of urgency



Requirements:

- Use professional but caring language

- Include a brief quote or paraphrase of the student's actual expression

- Be specific to this student's message (not generic)

- Keep it under 150 characters total

- Focus on the student's emotional state and expression



Examples:

- "Self-harm ideation detected. Student expressed feeling hopeless and wanting to end their life - requires immediate intervention."

- "Anxiety indicators detected. Student reported overwhelming panic and inability to focus - needs urgent support."

- "Substance abuse concerns detected. Student disclosed addiction patterns and drinking problems - requires treatment referral."



Generate the summary:`;



      // Call AI to generate the summary

      const response = await fetch('https://api.openai.com/v1/chat/completions', {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          model: 'gpt-3.5-turbo',

          messages: [

            {

              role: 'system',

              content: 'You are a professional school counselor creating concise, factual alert summaries for administrators.'

            },

            {

              role: 'user',

              content: prompt

            }

          ],

          max_tokens: 100,

          temperature: 0.3,

        }),

      });



      if (!response.ok) {

        console.error('[EscalationAlert] AI summary generation failed:', response.status);

        return this.getFallbackSummary(detection);

      }



      const data = await response.json();

      const aiSummary = data.choices?.[0]?.message?.content?.trim();

      

      if (aiSummary) {

        return aiSummary;

      } else {

        return this.getFallbackSummary(detection);

      }

      

    } catch (error) {

      console.error('[EscalationAlert] Error generating AI summary:', error);

      return this.getFallbackSummary(detection);

    }

  }



  /**

   * Fallback summary generation if AI fails

   */

  private static getFallbackSummary(detection: EscalationDetection): string {

    const { category, context } = detection;

    

    // Extract the most relevant part of student's message

    const studentMessage = context.length > 80 ? context.substring(0, 80) + '...' : context;

    

    const categoryLabels = {

      self_harm: 'Self-harm concerns',

      violence: 'Violent ideation',

      abuse: 'Abuse disclosure',

      substance_abuse: 'Substance abuse',

      mental_health_crisis: 'Mental health crisis',

      behavioral_concern: 'Behavioral concerns',

      check_in_missed: 'Check-in compliance',

      mood_trend_decline: 'Mood decline',

      other: 'Concerning content'

    };

    

    const label = categoryLabels[category.type] || 'Concerning content';

    

    if (category.type === 'check_in_missed') {

      return 'Student missed scheduled check-ins - requires follow-up and wellness check.';

    } else if (category.type === 'mood_trend_decline') {

      return 'Declining mood trend detected in check-ins - needs proactive support and monitoring.';

    } else {

      return `${label} detected. Student expressed: "${studentMessage}" - requires professional attention.`;

    }

  }



  /**

   * Generates trigger source based on detection category and method

   */

  private static generateTriggerSource(detection: EscalationDetection): string {

    // Map different detection categories to trigger source names as shown in images

    const triggerSourceMap = {

      self_harm: 'Pattern Detection',

      violence: 'Pattern Detection', 

      abuse: 'Pattern Detection',

      substance_abuse: 'AI Analysis',

      mental_health_crisis: 'AI Analysis',

      behavioral_concern: 'AI Analysis',

      check_in_missed: 'Check-in Monitor',

      mood_trend_decline: 'Mood Analysis',

      other: 'AI Analysis'

    };



    return triggerSourceMap[detection.category.type] || 'AI Analysis';

  }



  /**

   * Creates and processes a behavioral escalation alert (check-in or mood trend)

   */

  static async createBehavioralEscalationAlert(

    studentId: string,

    detection: EscalationDetection

  ): Promise<EscalationAlert> {

    try {

      console.log(`[EscalationAlert] Creating behavioral alert for student ${studentId}, type: ${detection.category.type}`)

      

      // Resolve the user ID from the studentId (could be UUID or custom studentId)

      const user = await prisma.user.findFirst({

        where: {

          OR: [

            { id: studentId },

            { studentId: studentId }

          ]

        },

        select: { id: true, firstName: true, lastName: true }

      });



      if (!user) {

        throw new Error(`User not found for studentId: ${studentId}`);

      }



      const userId = user.id;

      const studentName = `${user.firstName} ${user.lastName}`;



      console.log(`[EscalationAlert] Resolved user ID: ${userId} for studentId: ${studentId}`);

      

      // Create alert record in database

      const alert = await prisma.escalationAlert.create({

        data: {

          studentId: userId, // Use the resolved user ID

          sessionId: 'behavioral-monitoring', // Special session ID for behavioral alerts

          studentName: studentName, // Use the resolved name

          studentClass: await this.getStudentClass(studentId), // Get student class using the original studentId

          category: detection.category.type,

          level: detection.level.level,

          severity: detection.level.severity,

          confidence: detection.category.confidence,

          detectedPhrases: detection.detectedPhrases,

          context: detection.context,

          recommendation: detection.recommendation,

          description: await this.generateAlertDescription(detection),

          detectionMethod: this.generateTriggerSource(detection),

          messageContent: detection.context, // Use context as message content for behavioral alerts

          messageTimestamp: detection.timestamp,

          requiresImmediateAction: detection.level.requiresImmediateAction,

          status: 'open',

          priority: detection.level.level,

        }

      })



      console.log(`[EscalationAlert] Behavioral alert created with ID: ${alert.id}`)



      // Send notifications to appropriate staff

      await this.sendNotifications(alert.id, detection.level.level, detection.level.requiresImmediateAction)



      // Create admin notifications

      await this.createAdminNotifications(alert.id, detection)



      // Send email notifications to admins

      const { EscalationEmailService } = await import('./escalation-email-service')

      await EscalationEmailService.sendEscalationEmails(alert.id)



      return {

        id: alert.id,

        studentId,

        sessionId: 'behavioral-monitoring',

        detection,

        messageContent: detection.context,

        messageTimestamp: detection.timestamp,

        status: 'pending',

        createdAt: alert.createdAt.toISOString(),

        updatedAt: alert.updatedAt.toISOString()

      }

    } catch (error) {

      console.error('[EscalationAlert] Failed to create behavioral escalation alert:', error)

      throw new Error('Failed to create behavioral escalation alert')

    }

  }



  /**

   * Runs behavioral checks for all students and creates alerts if needed

   */

  static async runBehavioralMonitoringForAllStudents(): Promise<void> {

    try {

      console.log('[EscalationAlert] Starting behavioral monitoring for all students');



      // Get all active students

      const students = await prisma.user.findMany({

        where: {

          role: {

            name: 'STUDENT'

          }

        },

        select: {

          studentId: true,

          firstName: true,

          lastName: true

        }

      });



      console.log(`[EscalationAlert] Checking ${students.length} students for behavioral escalations`);



      let totalAlertsCreated = 0;



      for (const student of students) {

        try {

          // Run behavioral checks for this student

          const escalations = await BehavioralEscalationDetector.runBehavioralChecks(student.studentId!);



          // Create alerts for any detected escalations

          for (const escalation of escalations) {

            await this.createBehavioralEscalationAlert(student.studentId!, escalation);

            totalAlertsCreated++;

          }



        } catch (error) {

          console.error(`[EscalationAlert] Error checking student ${student.studentId}:`, error);

        }

      }



      console.log(`[EscalationAlert] Behavioral monitoring completed. Created ${totalAlertsCreated} alerts.`);



    } catch (error) {

      console.error('[EscalationAlert] Error in behavioral monitoring:', error);

    }

  }



  /**

   * 🟨 STEP 4: Define Alert Behavior - Handle alerts intelligently

   */

  static async handleAlertIntelligently(

    studentId: string,

    detection: EscalationDetection,

    messageContent: string,

    messageTimestamp: string,

    counselorId?: string

  ): Promise<{ alert: EscalationAlert; sessionCreated: boolean; sessionId: string }> {

    try {

      // Get student's school info

      const user = await prisma.user.findFirst({

        where: {

          OR: [

            { id: studentId },

            { studentId: studentId }

          ]

        },

        select: { id: true, firstName: true, lastName: true, schoolId: true }

      });



      if (!user) {

        throw new Error(`User not found for studentId: ${studentId}`);

      }



      // Check student's current session status

      const activeSession = await prisma.counselingSession.findFirst({

        where: {

          studentId: user.id,

          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },

          schoolId: user.schoolId || undefined

        },

        orderBy: { scheduledAt: 'asc' }

      });



      const completedSession = await prisma.counselingSession.findFirst({

        where: {

          studentId: user.id,

          status: 'COMPLETED',

          schoolId: user.schoolId || undefined

        },

        orderBy: { endedAt: 'desc' }

      });



      let sessionId: string;

      let sessionCreated = false;



      if (activeSession) {

        // Case B: Session already active → Do NOT create new session, attach alert to existing session

        sessionId = activeSession.id;



        // If session is SCHEDULED, automatically start it when alert is created

        if (activeSession.status === 'SCHEDULED') {

          try {

            const { CounselingService } = await import('../../server/counseling/counseling.service');

            const service = new CounselingService();

            const schoolId = user.schoolId || activeSession.schoolId || '';

            if (schoolId) {

              await service.startSession(sessionId, schoolId, counselorId || 'system');

              console.log(`[AlertBehavior] Automatically started scheduled session ${sessionId} due to new alert`);

            }

          } catch (error) {

            console.error(`[AlertBehavior] Failed to start session ${sessionId}:`, error);

            // Don't fail the alert creation if session start fails

          }

        }



        console.log(`[AlertBehavior] Case B: Attaching alert to active session ${sessionId}`);

      } else if (completedSession) {

        // Case C: Session completed → Create new FOLLOW-UP session

        const counselingService = (await import('../../server/counseling/counseling.service')).CounselingService;

        const service = new counselingService();

        

        // Create follow-up session for tomorrow at same time

        const tomorrow = new Date();

        tomorrow.setDate(tomorrow.getDate() + 1);

        tomorrow.setHours(10, 0, 0, 0); // 10 AM tomorrow



        const newSession = await service.createSession(

          counselorId || 'system', // Use provided counselor or fallback

          user.schoolId || "",

          {

            studentId: user.id,

            date: tomorrow.toISOString().split('T')[0],

            time: '10:00',

            sessionType: 'FOLLOW_UP' as any

          }

        );



        sessionId = newSession.id;

        sessionCreated = true;

        console.log(`[AlertBehavior] Case C: Created new follow-up session ${sessionId}`);

      } else {

        // Case A: No active session → Create a new session (intake or follow-up)

        const { CounselingService } = await import('../../server/counseling/counseling.service');

        const service = new CounselingService();

        

        // Check if student has any prior intake session

        const hasIntakeSession = await prisma.counselingSession.findFirst({

          where: {

            studentId: user.id,

            sessionType: 'INTAKE',

            schoolId: user.schoolId || undefined

          }

        });



        // Determine session type based on student's history

        const sessionType = hasIntakeSession ? 'FOLLOW_UP' : 'INTAKE';

        

        // Create session for tomorrow at 10 AM

        const tomorrow = new Date();

        tomorrow.setDate(tomorrow.getDate() + 1);

        tomorrow.setHours(10, 0, 0, 0);



        const newSession = await service.createSession(

          counselorId || 'system',

          user.schoolId || "",

          {

            studentId: user.id,

            date: tomorrow.toISOString().split('T')[0],

            time: '10:00',

            sessionType: sessionType as any

          }

        );



        sessionId = newSession.id;

        sessionCreated = true;

        console.log(`[AlertBehavior] Case A: Created new ${sessionType} session ${sessionId}`);

      }



      // Create the escalation alert

      const alert = await this.createEscalationAlert(

        studentId,

        sessionId,

        detection,

        messageContent,

        messageTimestamp

      );



      return { alert, sessionCreated, sessionId };



    } catch (error) {

      console.error('[AlertBehavior] Failed to handle alert intelligently:', error);

      throw error;

    }

  }



  /**

   * Updates session status in CounselorAssignment when session is started

   */

  static async updateSessionStatusOnSessionStart(sessionId: string): Promise<void> {

    try {

      const session = await prisma.counselingSession.findUnique({

        where: { id: sessionId },

        select: { studentId: true, counselorId: true }

      });



      if (session) {

        await prisma.counselorAssignment.updateMany({

          where: {

            studentId: session.studentId,

            counselorId: session.counselorId

          },

          data: {

            sessionStatus: 'IN_PROGRESS'

          }

        });



        console.log(`[EscalationAlert] Updated session status to IN_PROGRESS for student ${session.studentId}, counselor ${session.counselorId}`);

      }

    } catch (error) {

      console.error('[EscalationAlert] Failed to update session status on session start:', error);

    }

  }



  /**

   * Updates alert status when session addressing it is completed

   */

  static async updateAlertStatusOnSessionCompletion(sessionId: string): Promise<void> {

    try {

      const alerts = await prisma.escalationAlert.findMany({

        where: {

          sessionId: sessionId,

          status: { in: ['open', 'reviewed', 'UNDER_REVIEW'] }

        }

      });



      if (alerts.length > 0) {

        await prisma.escalationAlert.updateMany({

          where: {

            sessionId: sessionId,

            status: { in: ['open', 'reviewed', 'UNDER_REVIEW'] }

          },

          data: {

            status: 'resolved',

            notes: 'Session completed - alert addressed'

          }

        });



        console.log(`[EscalationAlert] Updated ${alerts.length} alerts to resolved for session ${sessionId}`);

      }



      // Update session status in CounselorAssignment table

      const session = await prisma.counselingSession.findUnique({

        where: { id: sessionId },

        select: { studentId: true, counselorId: true }

      });



      if (session) {

        await prisma.counselorAssignment.updateMany({

          where: {

            studentId: session.studentId,

            counselorId: session.counselorId

          },

          data: {

            sessionStatus: 'COMPLETED'

          }

        });



        console.log(`[EscalationAlert] Updated session status to COMPLETED for student ${session.studentId}, counselor ${session.counselorId}`);

      }

    } catch (error) {

      console.error('[EscalationAlert] Failed to update alert status on session completion:', error);

    }

  }



  /**

   * Gets alert history for a student to track risk over time

   */

  static async getStudentAlertHistory(studentId: string, schoolId: string, limit: number = 10) {

    try {

      const alerts = await prisma.escalationAlert.findMany({

        where: {

          studentId,

          user: {

            schoolId: schoolId

          }

        },

        include: {

          counselingSession: {

            select: {

              id: true,

              sessionType: true,

              status: true,

              scheduledAt: true,

              startedAt: true,

              endedAt: true,

              counselor: {

                select: {

                  id: true,

                  firstName: true,

                  lastName: true

                }

              }

            }

          }

        },

        orderBy: { createdAt: 'desc' },

        take: limit

      });



      return alerts.map(alert => ({

        ...alert,

        riskLevel: alert.level,

        requiresImmediateAction: alert.requiresImmediateAction,

        sessionContext: alert.counselingSession ? {

          type: alert.counselingSession.sessionType,

          status: alert.counselingSession.status,

          counselor: `${alert.counselingSession.counselor.firstName} ${alert.counselingSession.counselor.lastName}`,

          duration: alert.counselingSession.startedAt && alert.counselingSession.endedAt 

            ? Math.round((alert.counselingSession.endedAt.getTime() - alert.counselingSession.startedAt.getTime()) / 60000)

            : null

        } : null

      }));

    } catch (error) {

      console.error('[EscalationAlert] Failed to get student alert history:', error);

      throw error;

    }

  }



  /**

   * Checks if multiple alerts occurred within a short timeframe for grouping

   */

  private async shouldGroupAlerts(studentId: string, schoolId: string, timeWindowMinutes: number = 30): Promise<boolean> {

    const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    

    const recentAlerts = await prisma.escalationAlert.count({

      where: {

        studentId,

        user: {

          schoolId: schoolId

        },

        createdAt: {

          gte: timeWindow

        },

        status: 'open'

      }

    });



    return recentAlerts > 0;

  }



  /**

   * Creates and processes an escalation alert with enhanced session mapping

   */

  static async createEscalationAlert(

    studentId: string,

    sessionId: string,

    detection: EscalationDetection,

    messageContent: string,

    messageTimestamp: string,

    priority?: string

  ): Promise<EscalationAlert> {

    try {

      console.log(`[EscalationAlert] Creating alert for student ${studentId}, session ${sessionId}`)

      

      // Resolve the user ID from the studentId (could be the UUID or the custom studentId field)

      const user = await prisma.user.findFirst({

        where: {

          OR: [

            { id: studentId },

            { studentId: studentId }

          ]

        },

        select: { id: true, firstName: true, lastName: true }

      });



      if (!user) {

        throw new Error(`User not found for studentId: ${studentId}`);

      }



      const userId = user.id;

      const studentName = `${user.firstName} ${user.lastName}`;



      console.log(`[EscalationAlert] Resolved user ID: ${userId} for studentId: ${studentId}`);



      // 1. Create alert record in database FIRST

      const alert = await prisma.escalationAlert.create({

        data: {

          studentId: userId, // Use the resolved user ID

          sessionId,

          studentName: studentName, // Use the resolved name

          studentClass: await this.getStudentClass(studentId), // Get student class using the original studentId

          category: detection.category.type,

          level: detection.level.level,

          severity: detection.level.severity,

          confidence: detection.category.confidence,

          detectedPhrases: detection.detectedPhrases,

          context: detection.context,

          recommendation: detection.recommendation,

          description: await this.generateAlertDescription(detection),

          detectionMethod: this.generateTriggerSource(detection),

          messageContent,

          messageTimestamp,

          requiresImmediateAction: detection.level.requiresImmediateAction,

          status: 'open',

          priority: detection.level.level,

        }

      });



      // 2. Link the counseling session back to this escalation alert

      if (sessionId) {

        try {

          await prisma.counselingSession.update({

            where: { id: sessionId },

            data: {

              escalationId: alert.id,

            },

          });

        } catch (linkError) {

          console.error(`[EscalationAlert] Failed to link session ${sessionId} to alert ${alert.id}`);

        }

      }

      

      // Send notifications to appropriate staff

      await this.sendNotifications(alert.id, detection.level.level, detection.level.requiresImmediateAction)



      // Create admin notifications

      await this.createAdminNotifications(alert.id, detection)



      // Send email notifications to admins

      const { EscalationEmailService } = await import('./escalation-email-service')

      await EscalationEmailService.sendEscalationEmails(alert.id)



      return {

        id: alert.id,

        studentId,

        sessionId,

        detection,

        messageContent,

        messageTimestamp,

        status: 'pending',

        createdAt: alert.createdAt.toISOString(),

        updatedAt: alert.updatedAt.toISOString()

      }

    } catch (error) {

      console.error('[EscalationAlert] Failed to create escalation alert:', error)

      throw new Error('Failed to create escalation alert')

    }

  }



  /**

   * Sends notifications through appropriate channels

   */

  private static async sendNotifications(

    alertId: string,

    level: string,

    requiresImmediateAction: boolean

  ): Promise<void> {

    try {

      console.log(`[EscalationAlert] Starting notifications for alert ${alertId} (level: ${level})`)

      

      // Get notification settings based on escalation level

      const notificationSettings = await this.getNotificationSettings(level)

      

      console.log(`[EscalationAlert] Email notifications enabled: ${notificationSettings.channels.find(c => c.type === 'email')?.enabled}`)

      

      // Get relevant staff members to notify

      const staffToNotify = await this.getStaffToNotify(level, requiresImmediateAction)

      

      console.log(`[EscalationAlert] Notifying ${staffToNotify.length} staff members for alert ${alertId}`)



      // Send notifications through each enabled channel

      for (const channel of notificationSettings.channels) {

        if (channel.enabled) {

          console.log(`[EscalationAlert] Sending ${channel.type} notification for alert ${alertId}`)

          await this.sendChannelNotification(alertId, channel, staffToNotify, level)

        }

      }

    } catch (error) {

      console.error('[EscalationAlert] Failed to send notifications:', error)

      // Don't throw here - we don't want to fail the alert creation if notifications fail

    }

  }



  

  /**

   * Gets notification settings based on escalation level

   */

  private static async getNotificationSettings(level: string): Promise<{

    channels: NotificationChannel[]

  }> {

    // Default notification settings - these could be configurable in the database

    const defaultSettings = {

      channels: [

        {

          type: 'in_app' as const,

          enabled: true,

          config: {}

        },

        {

          type: 'email' as const,

          enabled: true, // Enable emails for all escalation levels

          config: {

            template: 'escalation_alert',

            urgent: level === 'critical'

          }

        },

        {

          type: 'sms' as const,

          enabled: level === 'critical',

          config: {

            urgent: true

          }

        }

      ]

    }



    return defaultSettings

  }



  /**

   * Gets staff members who should be notified

   */

  private static async getStaffToNotify(

    level: string,

    requiresImmediateAction: boolean

  ): Promise<Array<{ id: string; email: string; phone?: string; role: string }>> {

    const whereClause: any = {

      role: {

        name: {

          in: ['SCHOOL_SUPERADMIN', 'ADMIN', 'COUNSELOR']

        }

      }

    }



    // For critical escalations, include all admin staff

    if (level === 'critical' || requiresImmediateAction) {

      whereClause.role.name.in.push('TEACHER')

    }



    const staff = await prisma.user.findMany({

      where: whereClause,

      select: {

        id: true,

        email: true,

        phone: true,

        role: {

          select: {

            name: true

          }

        }

      }

    })



    return staff.map(member => ({

      id: member.id,

      email: member.email,

      phone: member.phone || undefined,

      role: member.role.name

    }))

  }



  /**

   * Sends notification through a specific channel

   */

  private static async sendChannelNotification(

    alertId: string,

    channel: NotificationChannel,

    recipients: Array<{ id: string; email: string; phone?: string; role: string }>,

    level: string

  ): Promise<void> {

    try {

      switch (channel.type) {

        case 'email':

          await this.sendEmailNotification(alertId, recipients, level)

          break

        case 'sms':

          await this.sendSMSNotification(alertId, recipients.filter(r => r.phone), level)

          break

        case 'in_app':

          // In-app notifications are already created via createAdminNotifications

          break

        case 'webhook':

          await this.sendWebhookNotification(alertId, level)

          break

      }

    } catch (error) {

      console.error(`[EscalationAlert] Failed to send ${channel.type} notification:`, error)

    }

  }



  /**

   * Sends email notifications

   */

  private static async sendEmailNotification(

    alertId: string,

    recipients: Array<{ id: string; email: string; role: string }>,

    level: string

  ): Promise<void> {

    // This would integrate with your email service (SendGrid, etc.)

    console.log(`[EscalationAlert] Would send email notification for alert ${alertId} to ${recipients.length} recipients`)

    

    // Example implementation:

    // for (const recipient of recipients) {

    //   await emailService.send({

    //     to: recipient.email,

    //     template: 'escalation_alert',

    //     data: { alertId, level, urgent: level === 'critical' }

    //   })

    // }

  }



  /**

   * Sends SMS notifications

   */

  private static async sendSMSNotification(

    alertId: string,

    recipients: Array<{ id: string; phone?: string; role: string }>,

    level: string

  ): Promise<void> {

    // Filter recipients who have phone numbers

    const recipientsWithPhones = recipients.filter(r => r.phone)

    

    // This would integrate with your SMS service (Twilio, etc.)

    console.log(`[EscalationAlert] Would send SMS notification for alert ${alertId} to ${recipientsWithPhones.length} recipients`)

    

    // Example implementation:

    // for (const recipient of recipientsWithPhones) {

    //   await smsService.send({

    //     to: recipient.phone!,

    //     message: `URGENT: Escalation alert ${alertId} requires immediate attention`

    //   })

    // }

  }



  /**

   * Sends webhook notifications

   */

  private static async sendWebhookNotification(

    alertId: string,

    level: string

  ): Promise<void> {

    // This would send to external monitoring systems

    console.log(`[EscalationAlert] Would send webhook notification for alert ${alertId}`)

  }



  /**

   * Generates notification message

   */

  private static generateNotificationMessage(detection: EscalationDetection): string {

    const { category, level } = detection

    

    const categoryDescriptions = {

      self_harm: 'Self-harm or suicidal ideation',

      violence: 'Violent thoughts or threats',

      abuse: 'Abuse or harassment disclosure',

      substance_abuse: 'Substance abuse concerns',

      mental_health_crisis: 'Mental health crisis',

      behavioral_concern: 'Behavioral concerns',

      check_in_missed: 'Missed check-ins',

      mood_trend_decline: 'Mood decline trend',

      other: 'Concerning content'

    }



    return `Escalation Alert: ${categoryDescriptions[category.type]} detected (${level.level} severity). Immediate attention required.`

  }



  /**

   * Updates alert status

   */

  static async updateAlertStatus(

    alertId: string,

    status: 'pending' | 'reviewed' | 'resolved' | 'false_positive',

    assignedTo?: string,

    notes?: string

  ): Promise<void> {

    try {

      await prisma.escalationAlert.update({

        where: { id: alertId },

        data: {

          status,

          assignedTo,

          notes,

          updatedAt: new Date()

        }

      })



      console.log(`[EscalationAlert] Alert ${alertId} status updated to ${status}`)

    } catch (error) {

      console.error('[EscalationAlert] Failed to update alert status:', error)

      throw new Error('Failed to update alert status')

    }

  }



  /**

   * Gets pending alerts for admin dashboard

   */

  static async getPendingAlerts(

    limit: number = 50,

    offset: number = 0

  ): Promise<EscalationAlert[]> {

    try {

      const alerts = await prisma.escalationAlert.findMany({

        where: { status: 'pending' },

        orderBy: { createdAt: 'desc' },

        take: limit,

        skip: offset,

        include: {

          user: {

            select: {

              studentId: true,

              email: true

            }

          }

        }

      })



      return alerts.map((alert: any) => ({

        id: alert.id,

        studentId: alert.user.studentId,

        sessionId: alert.sessionId,

        detection: {

          isEscalation: true,

          category: {

            type: alert.category as any,

            confidence: alert.confidence

          },

          level: {

            level: alert.level as any,

            severity: alert.severity,

            requiresImmediateAction: alert.requiresImmediateAction

          },

          detectedPhrases: alert.detectedPhrases,

          context: alert.context,

          recommendation: alert.recommendation,

          timestamp: alert.createdAt.toISOString()

        },

        messageContent: alert.messageContent,

        messageTimestamp: alert.messageTimestamp,

        status: alert.status as any,

        assignedTo: alert.assignedTo || undefined,

        notes: alert.notes || undefined,

        createdAt: alert.createdAt.toISOString(),

        updatedAt: alert.updatedAt.toISOString()

      }))

    } catch (error) {

      console.error('[EscalationAlert] Failed to get pending alerts:', error)

      return []

    }

  }



  /**

   * Creates admin notifications for escalation alerts

   */

  static async createAdminNotifications(alertId: string, detection: EscalationDetection) {

    try {

      // Create notifications for all escalation levels

      console.log(`[EscalationAlert] Creating admin notification for ${detection.level.level} escalation`);

      

      // Get staff members based on escalation level

      let staffRoles = ['SCHOOL_SUPERADMIN', 'ADMIN', 'COUNSELOR'];

      

      // Include teachers for critical and high escalations

      if (detection.level.level === 'critical' || detection.level.level === 'high') {

        staffRoles.push('TEACHER');

      }

      

      const staffUsers = await prisma.user.findMany({

        where: {

          role: {

            name: {

              in: staffRoles

            }

          }

        },

        select: {

          id: true,

          firstName: true,

          lastName: true,

          email: true,

          role: {

            select: {

              name: true

            }

          }

        }

      });



      console.log(`[EscalationAlert] Found ${staffUsers.length} staff members:`, staffRoles);

      

      if (staffUsers.length === 0) {

        console.log('[EscalationAlert] WARNING: No staff users found! Notifications cannot be created.');

        console.log('[EscalationAlert] Available roles in system:');

        

        // Check what roles actually exist

        const allRoles = await prisma.role.findMany({

          select: { name: true }

        });

        console.log('[EscalationAlert] Available roles:', allRoles.map(r => r.name));

        

        // Check all users

        const allUsers = await prisma.user.findMany({

          select: { 

            firstName: true, 

            lastName: true, 

            role: { select: { name: true } } 

          }

        });

        console.log('[EscalationAlert] All users:', allUsers.map(u => `${u.firstName} ${u.lastName} (${u.role?.name || 'No role'})`));

        

        return; // Exit early if no staff users

      }



      const notificationMessage = ` ${detection.level.level.toUpperCase()} ESCALATION: ${detection.category.type.replace('_', ' ').toUpperCase()}`;



      // Deduplicate staff users by ID

      const uniqueStaff = staffUsers.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);



      for (const staff of uniqueStaff) {

        // Check if notification already exists for this staff and alert

        if (staff.role?.name === 'COUNSELOR') {

          const existing = await prisma.counselorNotification.findFirst({

            where: { userId: staff.id, alertId: alertId }

          });

          if (existing) continue;



          await prisma.counselorNotification.create({

            data: {

              userId: staff.id,

              alertId: alertId,

              type: 'escalation',

              message: notificationMessage,

              severity: detection.level.level,

              read: false

            }

          });

        } else {

          const existing = await prisma.adminNotification.findFirst({

            where: { userId: staff.id, alertId: alertId }

          });

          if (existing) continue;



          await prisma.adminNotification.create({

            data: {

              userId: staff.id,

              alertId: alertId,

              type: 'escalation',

              message: notificationMessage,

              severity: detection.level.level,

              read: false

            }

          });

        }

      }



      console.log(`[EscalationAlert] Created ${staffUsers.length} admin notifications for ${detection.level.level} alert ${alertId}`);

    } catch (error) {

      console.error('[EscalationAlert] Error creating admin notifications:', error);

    }

  }



  /**

   * Gets escalation statistics

   */

  static async getEscalationStats(

    startDate?: Date,

    endDate?: Date

  ): Promise<{

    total: number

    byCategory: Record<string, number>

    byLevel: Record<string, number>

    byStatus: Record<string, number>

    averageResponseTime: number

  }> {

    try {

      const whereClause: any = {}

      if (startDate || endDate) {

        whereClause.createdAt = {}

        if (startDate) whereClause.createdAt.gte = startDate

        if (endDate) whereClause.createdAt.lte = endDate

      }



      const alerts = await prisma.escalationAlert.findMany({

        where: whereClause,

        select: {

          category: true,

          level: true,

          status: true,

          createdAt: true,

          updatedAt: true

        }

      })



      const stats = {

        total: alerts.length,

        byCategory: {} as Record<string, number>,

        byLevel: {} as Record<string, number>,

        byStatus: {} as Record<string, number>,

        averageResponseTime: 0

      }



      let totalResponseTime = 0

      let responseCount = 0



      for (const alert of alerts) {

        // Count by category

        stats.byCategory[alert.category] = (stats.byCategory[alert.category] || 0) + 1

        

        // Count by level

        stats.byLevel[alert.level] = (stats.byLevel[alert.level] || 0) + 1

        

        // Count by status

        stats.byStatus[alert.status] = (stats.byStatus[alert.status] || 0) + 1

        

        // Calculate response time for resolved alerts

        if (alert.status === 'resolved') {

          const responseTime = alert.updatedAt.getTime() - alert.createdAt.getTime()

          totalResponseTime += responseTime

          responseCount++

        }

      }



      stats.averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0



      return stats

    } catch (error) {

      console.error('[EscalationAlert] Failed to get escalation stats:', error)

      return {

        total: 0,

        byCategory: {},

        byLevel: {},

        byStatus: {},

        averageResponseTime: 0

      }

    }

  }

}


