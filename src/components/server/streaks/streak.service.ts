import prisma from '@/src/prisma';
import { BadgeService } from '../badges/badge.service';

export class StreakService {
  /**
   * Updates user's streak based on activity
   * Eligible activities: login, mood check-in, journal, self-help session
   */
  static async updateStreak(userId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day

      const existingStreak = await prisma.streak.findUnique({
        where: { userId },
      });

      if (!existingStreak) {
        // Create new streak record
        const newStreak = await prisma.streak.create({
          data: {
            userId,
            count: 1,
            lastActive: today,
          },
        });

        // Evaluate badges after creating streak
        await BadgeService.evaluateUserBadges(userId);
        
        return newStreak;
      }

      const lastActive = new Date(existingStreak.lastActive);
      lastActive.setHours(0, 0, 0, 0); // Start of day

      const daysDiff = this.getDaysDifference(lastActive, today);

      let newCount = existingStreak.count;

      switch (daysDiff) {
        case 0:
          // Same day - no change
          break;
        case 1:
          // Yesterday - increment streak
          newCount++;
          break;
        default:
          // More than 1 day gap - reset to 1
          newCount = 1;
          break;
      }

      const updatedStreak = await prisma.streak.update({
        where: { userId },
        data: {
          count: newCount,
          lastActive: today,
        },
      });

      // Evaluate badges after updating streak
      await BadgeService.evaluateUserBadges(userId);

      return updatedStreak;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  /**
   * Gets user's current streak
   */
  static async getStreak(userId: string) {
    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    return streak || {
      count: 0,
      lastActive: new Date(),
    };
  }

  /**
   * Calculates the difference in days between two dates
   */
  private static getDaysDifference(date1: Date, date2: Date): number {
    const timeDiff = date2.getTime() - date1.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Checks if user was active today
   */
  static async wasActiveToday(userId: string): Promise<boolean> {
    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) return false;

    const today = new Date();
    const lastActive = new Date(streak.lastActive);

    return (
      today.getDate() === lastActive.getDate() &&
      today.getMonth() === lastActive.getMonth() &&
      today.getFullYear() === lastActive.getFullYear()
    );
  }

  /**
   * Manually resets streak (for admin use)
   */
  static async resetStreak(userId: string) {
    await prisma.streak.update({
      where: { userId },
      data: {
        count: 0,
        lastActive: new Date(),
      },
    });
  }
}
