import { BadgeService } from '../../services/badge.service';
import { StreakService } from '../../streaks/streak.service';

export class ActivityService {
  /**
   * Triggers badge evaluation after journal activity
   */
  static async afterJournalActivity(userId: string) {
    try {
      // Update streak (journal counts as activity)
      await StreakService.updateStreak(userId);
      
      // Evaluate badges
      await BadgeService.evaluateUserBadges(userId);
    } catch (error) {
      console.error('Error in afterJournalActivity:', error);
    }
  }

  /**
   * Triggers badge evaluation after mood check-in
   */
  static async afterMoodCheckin(userId: string) {
    try {
      // Update streak (mood check-in counts as activity)
      await StreakService.updateStreak(userId);
      
      // Evaluate badges
      await BadgeService.evaluateUserBadges(userId);
    } catch (error) {
      console.error('Error in afterMoodCheckin:', error);
    }
  }

  /**
   * Triggers badge evaluation after self-help session
   */
  static async afterSelfHelpSession(userId: string) {
    try {
      // Update streak (self-help session counts as activity)
      await StreakService.updateStreak(userId);
      
      // Evaluate badges
      await BadgeService.evaluateUserBadges(userId);
    } catch (error) {
      console.error('Error in afterSelfHelpSession:', error);
    }
  }

  /**
   * Triggers badge evaluation after resource access
   */
  static async afterResourceAccess(userId: string) {
    try {
      // Update streak (resource access counts as activity)
      await StreakService.updateStreak(userId);
      
      // Evaluate badges
      await BadgeService.evaluateUserBadges(userId);
    } catch (error) {
      console.error('Error in afterResourceAccess:', error);
    }
  }

  /**
   * Triggers badge evaluation after login
   */
  static async afterLogin(userId: string) {
    try {
      // Update streak (login counts as activity)
      await StreakService.updateStreak(userId);
      
      // Evaluate badges
      await BadgeService.evaluateUserBadges(userId);
    } catch (error) {
      console.error('Error in afterLogin:', error);
    }
  }
}
