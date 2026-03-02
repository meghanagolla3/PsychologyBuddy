import { EscalationDetection, EscalationCategory, EscalationLevel } from './content-escalation-detector';
import prisma from '../../prisma';

export class BehavioralEscalationDetector {
  /**
   * Checks for missed check-ins and creates escalation if needed
   */
  static async checkMissedCheckIns(studentId: string): Promise<EscalationDetection | null> {
    try {
      // Get the student's recent check-in history
      const checkIns = await prisma.moodCheckin.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: 'desc' },
        take: 7, // Last 7 check-ins
        select: { 
          createdAt: true,
          mood: true,
          date: true
        }
      });

      if (checkIns.length === 0) {
        // No check-ins at all - this could be a new student or system issue
        return null;
      }

      const now = new Date();
      const daysSinceLastCheckIn = Math.floor(
        (now.getTime() - checkIns[0].createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine escalation level based on days missed
      let level: EscalationLevel['level'];
      let severity: number;
      let requiresImmediateAction: boolean;

      if (daysSinceLastCheckIn >= 5) {
        level = 'critical';
        severity = 9;
        requiresImmediateAction = true;
      } else if (daysSinceLastCheckIn >= 3) {
        level = 'high';
        severity = 7;
        requiresImmediateAction = true;
      } else if (daysSinceLastCheckIn >= 2) {
        level = 'medium';
        severity = 5;
        requiresImmediateAction = false;
      } else if (daysSinceLastCheckIn >= 1) {
        level = 'low';
        severity = 3;
        requiresImmediateAction = false;
      } else {
        return null; // No missed check-ins
      }

      return {
        isEscalation: true,
        category: {
          type: 'check_in_missed',
          confidence: 0.9 // High confidence for check-in data
        },
        level: {
          level,
          severity,
          requiresImmediateAction
        },
        detectedPhrases: [],
        context: `Student has missed ${daysSinceLastCheckIn} days of check-ins. Last check-in was ${daysSinceLastCheckIn} days ago.`,
        recommendation: this.generateCheckInRecommendation(level, daysSinceLastCheckIn),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('[BehavioralEscalation] Error checking missed check-ins:', error);
      return null;
    }
  }

  /**
   * Analyzes mood trends from recent check-ins
   */
  static async analyzeMoodTrends(studentId: string): Promise<EscalationDetection | null> {
    try {
      // Get the student's recent mood data
      const moodData = await prisma.moodCheckin.findMany({
        where: { 
          userId: studentId
        },
        orderBy: { createdAt: 'desc' },
        take: 10, // Last 10 check-ins
        select: { 
          mood: true,
          createdAt: true
        }
      });

      if (moodData.length < 3) {
        // Not enough data points for trend analysis
        return null;
      }

      // Calculate mood trend - convert mood strings to numbers
      const recentMoods = moodData.slice(0, 5).map((ci: any) => {
        // Convert mood string to number (assuming mood is stored as string like "1", "2", etc. or descriptive text)
        const moodNum = parseInt(ci.mood) || 0;
        return moodNum;
      });
      
      const olderMoods = moodData.slice(5, 10).map((ci: any) => {
        const moodNum = parseInt(ci.mood) || 0;
        return moodNum;
      });

      const recentAvg = recentMoods.reduce((sum: number, mood: number) => sum + mood, 0) / recentMoods.length;
      const olderAvg = olderMoods.reduce((sum: number, mood: number) => sum + mood, 0) / olderMoods.length;
      
      const moodDecline = olderAvg - recentAvg;

      // Determine escalation based on mood decline
      let level: EscalationLevel['level'];
      let severity: number;
      let requiresImmediateAction: boolean;

      if (moodDecline >= 3) {
        level = 'high';
        severity = 7;
        requiresImmediateAction = true;
      } else if (moodDecline >= 2) {
        level = 'medium';
        severity = 5;
        requiresImmediateAction = false;
      } else if (moodDecline >= 1) {
        level = 'low';
        severity = 3;
        requiresImmediateAction = false;
      } else {
        return null; // No significant mood decline
      }

      return {
        isEscalation: true,
        category: {
          type: 'mood_trend_decline',
          confidence: Math.min(0.5 + (moodDecline * 0.2), 0.9) // Confidence based on decline magnitude
        },
        level: {
          level,
          severity,
          requiresImmediateAction
        },
        detectedPhrases: [],
        context: `Mood decline of ${moodDecline.toFixed(1)} points detected. Recent average: ${recentAvg.toFixed(1)}, Previous average: ${olderAvg.toFixed(1)}. Based on ${moodData.length} recent check-ins.`,
        recommendation: this.generateMoodTrendRecommendation(level, moodDecline),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('[BehavioralEscalation] Error analyzing mood trends:', error);
      return null;
    }
  }

  /**
   * Runs all behavioral escalation checks for a student
   */
  static async runBehavioralChecks(studentId: string): Promise<EscalationDetection[]> {
    const escalations: EscalationDetection[] = [];

    try {
      // Check for missed check-ins
      const missedCheckInEscalation = await this.checkMissedCheckIns(studentId);
      if (missedCheckInEscalation) {
        escalations.push(missedCheckInEscalation);
      }

      // Check for mood trends
      const moodTrendEscalation = await this.analyzeMoodTrends(studentId);
      if (moodTrendEscalation) {
        escalations.push(moodTrendEscalation);
      }

      console.log(`[BehavioralEscalation] Found ${escalations.length} behavioral escalations for student ${studentId}`);
      
      return escalations;

    } catch (error) {
      console.error('[BehavioralEscalation] Error running behavioral checks:', error);
      return [];
    }
  }

  /**
   * Generates recommendation for missed check-ins
   */
  private static generateCheckInRecommendation(level: EscalationLevel['level'], daysMissed: number): string {
    const recommendations = {
      low: `Student missed ${daysMissed} day(s) of check-ins. Send automated reminder and monitor.`,
      medium: `Student missed ${daysMissed} days of check-ins. Send reminder and consider wellness check.`,
      high: `Student missed ${daysMissed} days of check-ins. Contact parents and schedule wellness check.`,
      critical: `Student missed ${daysMissed} days of check-ins. IMMEDIATE contact with parents/guardians required.`
    };

    return recommendations[level] || 'Monitor check-in compliance.';
  }

  /**
   * Generates recommendation for mood trends
   */
  private static generateMoodTrendRecommendation(level: EscalationLevel['level'], decline: number): string {
    const recommendations = {
      low: `Slight mood decline (${decline.toFixed(1)} points) detected. Continue monitoring.`,
      medium: `Mood decline (${decline.toFixed(1)} points) detected. Monitor closely and consider wellness check-in.`,
      high: `Significant mood decline (${decline.toFixed(1)} points) detected. Schedule counseling session.`,
      critical: `Severe mood decline detected. Immediate intervention required.`
    };

    return recommendations[level] || 'Monitor mood patterns.';
  }
}
