 import prisma from '@/src/prisma';
import { ModuleType } from './types/challenge.types';

export interface RewardCalculation {
  xpGained: number;
  badgeEarned?: string;
  levelUp?: number;
  achievements: string[];
}

export class RewardService {
  /**
   * Calculate XP rewards for different activities
   */
  static calculateActivityXp(
    moduleType: ModuleType, 
    action: string, 
    value?: number
  ): number {
    const xpMap = {
      JOURNALING: {
        entry_created: 10,
        audio_created: 15,
        art_created: 12,
      },
      MEDITATION: {
        session_completed: (value?: number) => {
          if (!value) return 15;
          const minutes = Math.floor(value / 60);
          return Math.min(15 + Math.floor(minutes / 5) * 5, 50); // 15-50 XP based on duration
        }
      },
      MUSIC: {
        session_completed: (value?: number) => {
          if (!value) return 10;
          const minutes = Math.floor(value / 60);
          return Math.min(10 + Math.floor(minutes / 10) * 5, 30); // 10-30 XP based on duration
        }
      },
      ARTICLE: {
        article_read: 10,
        article_completed: 15,
      }
    };

    const moduleXp = xpMap[moduleType];
    if (!moduleXp) return 0;

    const actionXp = (moduleXp as Record<string, number | ((value?: number) => number) | undefined>)[action];
    if (typeof actionXp === 'function') {
      return actionXp(value);
    }
    return actionXp || 0;
  }

  /**
   * Award XP to user and check for level up
   */
  static async awardXp(userId: string, xpAmount: number): Promise<RewardCalculation> {
    // For now, we'll use a simple XP tracking approach
    // In a full implementation, we'd create a UserProfile table
    const result: RewardCalculation = {
      xpGained: xpAmount,
      achievements: []
    };

    // Check for XP milestones
    const milestones = [100, 500, 1000, 2500, 5000, 10000];
    for (const milestone of milestones) {
      result.achievements.push(`${xpAmount} XP Earned!`);
    }

    return result;
  }

  /**
   * Calculate user level based on total XP
   */
  static calculateLevel(totalXp: number): number {
    // Exponential growth formula: level = floor(sqrt(totalXp / 100)) + 1
    return Math.floor(Math.sqrt(totalXp / 100)) + 1;
  }

  /**
   * Get XP required for next level
   */
  static getXpForNextLevel(currentLevel: number): number {
    const nextLevel = currentLevel + 1;
    return nextLevel * nextLevel * 100; // (level)^2 * 100
  }

  /**
   * Get XP progress in current level
   */
  static getLevelProgress(totalXp: number, currentLevel: number): {
    currentXp: number;
    xpNeeded: number;
    progressPercentage: number;
  } {
    const xpForCurrentLevel = (currentLevel - 1) * (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * currentLevel * 100;
    const currentXp = totalXp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progressPercentage = Math.min(100, (currentXp / xpNeeded) * 100);

    return {
      currentXp,
      xpNeeded,
      progressPercentage
    };
  }

  /**
   * Award badge to user (simplified for existing schema)
   */
  static async awardBadge(
    userId: string, 
    badgeId: string
  ): Promise<boolean> {
    try {
      // Check if badge exists
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        console.error('Badge not found:', badgeId);
        return false;
      }

      // Check if user already has this badge
      const existingBadge = await prisma.userBadge.findFirst({
        where: {
          userId,
          badgeId
        }
      });

      if (existingBadge) {
        return false; // Already earned
      }

      // Award badge
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
          earnedAt: new Date(),
        }
      });

      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  /**
   * Check and award challenge completion rewards (simplified)
   */
  static async processChallengeCompletion(
    userId: string, 
    challengeId: string
  ): Promise<RewardCalculation> {
    const userChallenge = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
      include: { challenge: true }
    });

    if (!userChallenge || userChallenge.status !== 'COMPLETED') {
      return {
        xpGained: 0,
        achievements: []
      };
    }

    // Fixed XP reward for completed challenges
    const xpReward = 50;
    const result: RewardCalculation = {
      xpGained: xpReward,
      achievements: ['Challenge Completed!']
    };

    return result;
  }

  /**
   * Get user's badges and achievements (simplified)
   */
  static async getUserBadges(userId: string): Promise<{
    earnedBadges: any[];
    totalBadges: number;
    recentBadges: any[];
  }> {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });

    const recentBadges = userBadges.slice(0, 5);

    return {
      earnedBadges: userBadges,
      totalBadges: userBadges.length,
      recentBadges
    };
  }
}
