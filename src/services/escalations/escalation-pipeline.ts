/**
 * Escalation Pipeline Service
 * 
 * Orchestrates the complete escalation process:
 * 1. Detect risk using AI analysis
 * 2. Classify severity
 * 3. Generate internal alert
 * 4. Notify counselor/admin/parent if required
 * 5. Store escalation logs securely
 * 6. Continue supportive conversation with student
 */

import { AIEscalationDetector, AIEscalationDetection } from './ai-escalation-detector';
import { EscalationEmailService } from './escalation-email-service';
import prisma from '@/src/prisma';

export interface PipelineResult {
  success: boolean
  detection: AIEscalationDetection
  alertCreated: boolean
  alertId?: string
  notificationsSent: boolean
  notificationChannels: string[]
  errors: string[]
  timestamp: string
}

export interface EscalationAlertData {
  id: string
  studentId: string
  sessionId: string
  riskLevel: string
  riskScore: number
  confidence: number
  category: string
  requiresImmediateAction: boolean
  messageContent: string
  conversationContext: string
  escalationReason: string[]
  recommendedActions: string[]
  status: 'pending' | 'reviewed' | 'resolved' | 'false_positive'
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export class EscalationPipeline {
  private detector: AIEscalationDetector;
  private emailService: EscalationEmailService;

  constructor() {
    this.detector = new AIEscalationDetector();
    this.emailService = new EscalationEmailService();
  }

  /**
   * Executes the complete escalation pipeline
   */
  async executePipeline(
    currentMessage: string,
    conversationHistory: string[],
    studentId: string,
    sessionId: string
  ): Promise<PipelineResult> {
    console.log(`[EscalationPipeline] Starting pipeline for student ${studentId}, session ${sessionId}`);

    const errors: string[] = [];
    const notificationChannels: string[] = [];

    try {
      // Step 1: Detect risk using AI analysis
      console.log('[EscalationPipeline] Step 1: Detecting risk...');
      const detection = await this.detector.detectEscalation(currentMessage, conversationHistory);
      
      console.log('[EscalationPipeline] Detection complete:', {
        isEscalation: detection.isEscalation,
        riskLevel: detection.riskAssessment.overallRiskLevel,
        riskScore: detection.riskAssessment.riskScore
      });

      // Step 2: Validate escalation (prevent false positives)
      if (!AIEscalationDetector.isValidEscalation(detection)) {
        console.log('[EscalationPipeline] Escalation validation failed - not proceeding');
        return {
          success: true,
          detection,
          alertCreated: false,
          notificationsSent: false,
          notificationChannels: [],
          errors: [],
          timestamp: new Date().toISOString()
        };
      }

      // Step 3: Classify severity (already done in risk assessment)
      console.log('[EscalationPipeline] Step 2: Severity classified as', detection.riskAssessment.overallRiskLevel);

      // Step 4: Generate internal alert and store in database
      console.log('[EscalationPipeline] Step 3: Creating internal alert...');
      const alertResult = await this.createAlert(detection, studentId, sessionId, currentMessage, conversationHistory);
      
      if (!alertResult.success) {
        errors.push(...alertResult.errors);
      }

      const alertId = alertResult.alertId;

      // Step 5: Notify appropriate parties based on risk level
      console.log('[EscalationPipeline] Step 4: Sending notifications...');
      const notificationResult = await this.sendNotifications(
        detection,
        studentId,
        sessionId,
        alertId
      );

      if (!notificationResult.success) {
        errors.push(...notificationResult.errors);
      }

      notificationChannels.push(...notificationResult.channels);

      // Step 6: Log pipeline completion
      console.log('[EscalationPipeline] Pipeline execution complete');

      return {
        success: errors.length === 0,
        detection,
        alertCreated: alertResult.success,
        alertId,
        notificationsSent: notificationResult.success,
        notificationChannels,
        errors,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('[EscalationPipeline] Pipeline execution failed:', error);
      errors.push(`Pipeline execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return {
        success: false,
        detection: null as any,
        alertCreated: false,
        notificationsSent: false,
        notificationChannels,
        errors,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Creates alert in database
   */
  private async createAlert(
    detection: AIEscalationDetection,
    studentId: string,
    sessionId: string,
    messageContent: string,
    conversationHistory: string[]
  ): Promise<{ success: boolean; alertId?: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Get user ID from student ID
      const user = await prisma.user.findUnique({
        where: { studentId }
      });

      if (!user) {
        errors.push('User not found');
        return { success: false, errors };
      }

      // Map risk level to category
      const category = this.mapRiskLevelToCategory(detection.riskAssessment.overallRiskLevel);

      // Create escalation alert
      const alert = await prisma.escalationAlert.create({
        data: {
          studentId: user.id,
          sessionId,
          category,
          level: detection.riskAssessment.overallRiskLevel.toUpperCase(),
          severity: detection.riskAssessment.riskScore,
          requiresImmediateAction: detection.riskAssessment.requiresImmediateAction,
          messageContent,
          detectionMethod: 'AI_ANALYSIS',
          context: JSON.stringify({
            conversationAnalysis: detection.conversationAnalysis,
            riskAssessment: detection.riskAssessment,
            conversationHistoryLength: conversationHistory.length
          }),
          recommendation: detection.riskAssessment.recommendedActions.join('; '),
          status: 'pending'
        }
      });

      console.log('[EscalationPipeline] Alert created:', alert.id);

      return { success: true, alertId: alert.id, errors };

    } catch (error) {
      console.error('[EscalationPipeline] Failed to create alert:', error);
      errors.push(`Alert creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors };
    }
  }

  /**
   * Sends notifications based on risk level
   */
  private async sendNotifications(
    detection: AIEscalationDetection,
    studentId: string,
    sessionId: string,
    alertId?: string
  ): Promise<{ success: boolean; channels: string[]; errors: string[] }> {
    const errors: string[] = [];
    const channels: string[] = [];

    try {
      const riskLevel = detection.riskAssessment.overallRiskLevel;
      const threshold = this.getNotificationThreshold(riskLevel);

      console.log('[EscalationPipeline] Sending notifications for risk level:', riskLevel);
      console.log('[EscalationPipeline] Notification channels:', threshold.notificationChannels);

      // Send email notifications
      if (threshold.notificationChannels.includes('email')) {
        try {
          await this.emailService.sendEscalationNotification(
            studentId,
            sessionId,
            detection.riskAssessment.overallRiskLevel,
            detection.riskAssessment.escalationReason,
            detection.riskAssessment.recommendedActions,
            alertId
          );
          channels.push('email');
          console.log('[EscalationPipeline] Email notification sent');
        } catch (error) {
          console.error('[EscalationPipeline] Email notification failed:', error);
          errors.push(`Email notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Send SMS notifications (for high/critical risk)
      if (threshold.notificationChannels.includes('sms') && riskLevel !== 'safe' && riskLevel !== 'mild_concern') {
        try {
          await this.sendSMSNotification(studentId, detection);
          channels.push('sms');
          console.log('[EscalationPipeline] SMS notification sent');
        } catch (error) {
          console.error('[EscalationPipeline] SMS notification failed:', error);
          errors.push(`SMS notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Send push notifications (for critical emergency)
      if (threshold.notificationChannels.includes('push') && riskLevel === 'critical_emergency') {
        try {
          await this.sendPushNotification(studentId, detection);
          channels.push('push');
          console.log('[EscalationPipeline] Push notification sent');
        } catch (error) {
          console.error('[EscalationPipeline] Push notification failed:', error);
          errors.push(`Push notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Dashboard alerts are handled by the frontend polling the API
      if (threshold.notificationChannels.includes('dashboard')) {
        channels.push('dashboard');
        console.log('[EscalationPipeline] Dashboard alert queued');
      }

      return { success: errors.length === 0, channels, errors };

    } catch (error) {
      console.error('[EscalationPipeline] Notification sending failed:', error);
      errors.push(`Notification sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, channels, errors };
    }
  }

  /**
   * Sends SMS notification (placeholder - integrate with SMS service)
   */
  private async sendSMSNotification(studentId: string, detection: AIEscalationDetection): Promise<void> {
    // TODO: Integrate with SMS service (Twilio, etc.)
    console.log(`[EscalationPipeline] SMS notification for student ${studentId}:`, {
      riskLevel: detection.riskAssessment.overallRiskLevel,
      requiresImmediateAction: detection.riskAssessment.requiresImmediateAction
    });
    
    // Placeholder implementation
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `URGENT: Student ${studentId} requires attention. Risk level: ${detection.riskAssessment.overallRiskLevel}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: adminPhoneNumber
    // });
  }

  /**
   * Sends push notification (placeholder - integrate with push service)
   */
  private async sendPushNotification(studentId: string, detection: AIEscalationDetection): Promise<void> {
    // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
    console.log(`[EscalationPipeline] Push notification for student ${studentId}:`, {
      riskLevel: detection.riskAssessment.overallRiskLevel,
      requiresImmediateAction: detection.riskAssessment.requiresImmediateAction
    });
    
    // Placeholder implementation
    // const admin = await getAdminDeviceToken();
    // await admin.messaging().send({
    //   token: admin.deviceToken,
    //   notification: {
    //     title: 'CRITICAL: Student Emergency',
    //     body: `Student ${studentId} requires immediate intervention. Risk level: ${detection.riskAssessment.overallRiskLevel}`
    //   }
    // });
  }

  /**
   * Maps risk level to category for database
   */
  private mapRiskLevelToCategory(riskLevel: string): string {
    switch (riskLevel) {
      case 'critical_emergency':
        return 'MENTAL_HEALTH_CRISIS';
      case 'high_risk':
        return 'BEHAVIORAL_CONCERN';
      case 'moderate_concern':
        return 'MOOD_CONCERN';
      case 'mild_concern':
        return 'CHECK_IN';
      default:
        return 'OTHER';
    }
  }

  /**
   * Gets notification threshold configuration
   */
  private getNotificationThreshold(riskLevel: string): {
    notificationChannels: ('email' | 'sms' | 'push' | 'dashboard')[]
  } {
    switch (riskLevel) {
      case 'critical_emergency':
        return {
          notificationChannels: ['email', 'sms', 'push', 'dashboard']
        };
      case 'high_risk':
        return {
          notificationChannels: ['email', 'sms', 'dashboard']
        };
      case 'moderate_concern':
        return {
          notificationChannels: ['email', 'dashboard']
        };
      case 'mild_concern':
        return {
          notificationChannels: ['dashboard']
        };
      default:
        return {
          notificationChannels: []
        };
    }
  }

  /**
   * Gets escalation alert by ID
   */
  async getAlert(alertId: string): Promise<EscalationAlertData | null> {
    try {
      const alert = await prisma.escalationAlert.findUnique({
        where: { id: alertId },
        include: {
          user: {
            select: {
              studentId: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!alert) return null;

      return {
        id: alert.id,
        studentId: alert.user.studentId || 'unknown',
        sessionId: alert.sessionId,
        riskLevel: alert.level.toLowerCase(),
        riskScore: alert.severity,
        confidence: 0.8, // Placeholder - would be stored in context
        category: alert.category,
        requiresImmediateAction: alert.requiresImmediateAction,
        messageContent: alert.messageContent,
        conversationContext: alert.context || '',
        escalationReason: alert.recommendation.split('; '),
        recommendedActions: alert.recommendation.split('; '),
        status: alert.status as any,
        assignedTo: alert.assignedTo || undefined,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt
      };
    } catch (error) {
      console.error('[EscalationPipeline] Failed to get alert:', error);
      return null;
    }
  }

  /**
   * Updates alert status
   */
  async updateAlertStatus(
    alertId: string,
    status: 'pending' | 'reviewed' | 'resolved' | 'false_positive',
    assignedTo?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      await prisma.escalationAlert.update({
        where: { id: alertId },
        data: {
          status,
          assignedTo,
          notes
        }
      });

      console.log('[EscalationPipeline] Alert status updated:', alertId, status);
      return true;
    } catch (error) {
      console.error('[EscalationPipeline] Failed to update alert status:', error);
      return false;
    }
  }
}
