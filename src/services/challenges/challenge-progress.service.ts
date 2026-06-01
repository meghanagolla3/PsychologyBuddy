import prisma from '@/src/prisma';
import { ModuleType, ChallengeType, UserChallengeStatus } from './types/challenge.types';

export interface ActivityEvent {
  userId: string;
  moduleType: ModuleType;
  action: string;
  value?: number;
  metadata?: any;
  timestamp: Date;
}

export class ChallengeProgressService {
  /**
   * Process an activity event and update all relevant challenge progress
   */
  static async processActivityEvent(event: ActivityEvent): Promise<void> {
    try {
      // Check if user exists in database
      const user = await prisma.user.findUnique({
        where: { id: event.userId }
      });

      if (!user) {
        console.error(`User ${event.userId} not found in database. Skipping activity event processing.`);
        return;
      }

      // 1. Get all active challenges for this user and module
      const activeChallenges = await this.getActiveChallengesForModule(event.userId, event.moduleType);

      // 2. Store the activity event for each challenge
      for (const userChallenge of activeChallenges) {
        await this.storeActivityEvent(event, userChallenge.challengeId);
      }

      // 3. Update progress for each challenge
      for (const userChallenge of activeChallenges) {
        await this.updateChallengeProgress(event, userChallenge);
      }

      // 4. Update user profile (XP, streak, etc.)
      await this.updateUserProfile(event);

      // 5. Check for challenge completions and award rewards
      await this.checkChallengeCompletions(event.userId);

    } catch (error) {
      console.error('Error processing activity event:', error);
      // Don't throw - we don't want to break the original activity flow
    }
  }

  /**
   * Store activity event in database
   */
  private static async storeActivityEvent(event: ActivityEvent, challengeId?: string): Promise<void> {
    await prisma.activityEvent.create({
      data: {
        userId: event.userId,
        moduleType: event.moduleType,
        action: event.action,
        value: event.value,
        metadata: event.metadata,
        timestamp: event.timestamp,
        challengeId,
      }
    });
  }

  /**
   * Get all active challenges for a user and specific module
   */
  private static async getActiveChallengesForModule(
    userId: string, 
    moduleType: ModuleType
  ): Promise<any[]> {
    return await prisma.userChallenge.findMany({
      where: {
        userId,
        status: {
          in: ['NOT_STARTED', 'IN_PROGRESS', 'ASSIGNED']
        },
        challenge: {
          moduleType,
          isActive: true
        }
      },
      include: {
        challenge: true
      }
    });
  }

  /**
   * Update progress for a specific challenge based on activity event
   */
  private static async updateChallengeProgress(
    event: ActivityEvent, 
    userChallenge: any
  ): Promise<void> {
    const { challenge } = userChallenge;
    let progressIncrement = 0;

    // Calculate progress based on challenge type and activity
    switch (challenge.challengeType) {
      case 'DAILY':
        progressIncrement = this.calculateDailyProgress(challenge, event);
        break;
      
      case 'WEEKLY':
        progressIncrement = this.calculateWeeklyProgress(challenge, event);
        break;
      
      case 'STREAK':
        progressIncrement = this.calculateStreakProgress(challenge, event);
        break;
      
      case 'MILESTONE':
        progressIncrement = this.calculateMilestoneProgress(challenge, event);
        break;
    }

    if (progressIncrement > 0) {
      await this.incrementChallengeProgress(userChallenge.id, progressIncrement);
    }
  }

  /**
   * Calculate progress for daily challenges
   */
  private static calculateDailyProgress(challenge: any, event: ActivityEvent): number {
    // Daily challenges typically complete in one action
    switch (challenge.targetUnit) {
      case 'ENTRIES':
        return event.action === 'entry_created' ? challenge.targetValue : 0;
      
      case 'SESSIONS':
        return event.action === 'session_completed' ? challenge.targetValue : 0;
      
      case 'MINUTES':
        return event.value || 0;
      
      case 'ARTICLES':
        return event.action === 'article_read' ? challenge.targetValue : 0;
      
      default:
        return 0;
    }
  }

  /**
   * Calculate progress for weekly challenges
   */
  private static calculateWeeklyProgress(challenge: any, event: ActivityEvent): number {
    // Weekly challenges accumulate over time
    switch (challenge.targetUnit) {
      case 'ENTRIES':
        return event.action === 'entry_created' ? 1 : 0;
      
      case 'SESSIONS':
        return event.action === 'session_completed' ? 1 : 0;
      
      case 'MINUTES':
        return event.value || 0;
      
      case 'ARTICLES':
        return event.action === 'article_read' ? 1 : 0;
      
      default:
        return 0;
    }
  }

  /**
   * Calculate progress for streak challenges
   */
  private static calculateStreakProgress(challenge: any, event: ActivityEvent): number {
    // Streak challenges check for consecutive days
    switch (challenge.targetUnit) {
      case 'DAYS':
        return event.action === 'entry_created' || 
               event.action === 'session_completed' || 
               event.action === 'article_read' ? 1 : 0;
      
      default:
        return 0;
    }
  }

  /**
   * Calculate progress for milestone challenges
   */
  private static calculateMilestoneProgress(challenge: any, event: ActivityEvent): number {
    // Milestone challenges accumulate towards a large goal
    switch (challenge.targetUnit) {
      case 'ENTRIES':
        return event.action === 'entry_created' ? 1 : 0;
      
      case 'SESSIONS':
        return event.action === 'session_completed' ? 1 : 0;
      
      case 'MINUTES':
        return event.value || 0;
      
      case 'ARTICLES':
        return event.action === 'article_read' ? 1 : 0;
      
      default:
        return 0;
    }
  }

  /**
   * Increment challenge progress
   */
  private static async incrementChallengeProgress(
    userChallengeId: string, 
    increment: number
  ): Promise<void> {
    const userChallenge = await prisma.userChallenge.findUnique({
      where: { id: userChallengeId },
      include: { challenge: true }
    });

    if (!userChallenge) return;

    const targetValue = userChallenge.challenge.targetValue ?? 0;

    const newProgress = Math.min(
      (userChallenge.currentProgress ?? 0) + increment,
      targetValue
    );

    const status = newProgress >= targetValue 
      ? 'COMPLETED' 
      : newProgress > 0 
        ? 'IN_PROGRESS' 
        : 'NOT_STARTED';

    const progressPercentage = targetValue > 0
      ? Math.round((newProgress / targetValue) * 100)
      : 0;

    await prisma.userChallenge.update({
      where: { id: userChallengeId },
      data: {
        currentProgress: newProgress,
        progressPercentage,
        status,
        startedAt: userChallenge.startedAt || (newProgress > 0 ? new Date() : userChallenge.startedAt),
        completedAt: status === 'COMPLETED' ? new Date() : userChallenge.completedAt,
        lastActivityAt: new Date(),
      }
    });
  }

  /**
   * Update user profile (XP, streak, etc.)
   */
  private static async updateUserProfile(event: ActivityEvent): Promise<void> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: event.userId }
    });

    if (!profile) {
      // Create profile if it doesn't exist
      await prisma.userProfile.create({
        data: {
          userId: event.userId,
          totalXp: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
          challengesCompleted: 0,
          badgesEarned: 0,
        }
      });
      return;
    }

    // Calculate XP based on activity
    const xpGained = this.calculateXpForActivity(event.moduleType, event.action, event.value);

    if (xpGained > 0) {
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          totalXp: profile.totalXp + xpGained,
        }
      });
    }
  }

  /**
   * Calculate XP for different activities
   */
  private static calculateXpForActivity(
    moduleType: ModuleType, 
    action: string, 
    value?: number
  ): number {
    const xpMap: Record<ModuleType, Record<string, number | ((value?: number) => number)>> = {
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

    const moduleXp = xpMap[moduleType as keyof typeof xpMap];
    if (!moduleXp) return 0;

    const actionXp = moduleXp[action as keyof typeof moduleXp];
    if (typeof actionXp === 'function') {
      return actionXp(value);
    }
    return actionXp || 0;
  }

  /**
   * Check for challenge completions and award rewards (simplified for existing schema)
   */
  private static async checkChallengeCompletions(userId: string): Promise<void> {
    // For now, we'll skip this as the new challenge models don't exist yet
    // This would be implemented when the full challenge schema is added
    console.log('Challenge completions check would run here for user:', userId);
  }

  /**
   * Award rewards for completed challenge (simplified for existing schema)
   */
  private static async awardChallengeRewards(userChallenge: any): Promise<void> {
    // For now, we'll skip this as the new challenge models don't exist yet
    // This would be implemented when the full challenge schema is added
    console.log('Challenge rewards would be awarded for:', userChallenge);
  }

  /**
   * Start a challenge for a user using existing schema
   */
  static async startChallenge(userId: string, challengeId: string): Promise<any> {
    try {
      // Check if challenge exists and is active
      const challenge = await prisma.challenge.findFirst({
        where: {
          id: challengeId,
          isActive: true
        }
      });

      if (!challenge) {
        throw new Error('Challenge not found or inactive');
      }

      // Create or update user challenge
      const userChallenge = await prisma.userChallenge.upsert({
        where: {
          userId_challengeId: {
            userId,
            challengeId
          }
        },
        update: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          lastActivityAt: new Date(),
          progressPercentage: 0
        },
        create: {
          userId,
          challengeId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          lastActivityAt: new Date(),
          progressPercentage: 0
        },
        include: {
          challenge: true
        }
      });

      // Transform to match expected format
      return {
        ...userChallenge,
        challenge: {
          ...userChallenge.challenge,
          moduleType: this.getModuleTypeFromFields(userChallenge.challenge),
          challengeType: this.getChallengeTypeFromName(userChallenge.challenge.name),
          targetValue: this.extractTargetValue(userChallenge.challenge),
          targetUnit: this.extractTargetUnit(userChallenge.challenge),
          rewardPoints: 10, // Default reward points since field doesn't exist in existing schema
          difficulty: this.getDifficultyFromName(userChallenge.challenge.name)
        }
      };
    } catch (error) {
      console.error('Error starting challenge:', error);
      throw error;
    }
  }

  /**
   * Get challenges for a specific module using existing schema
   */
  static async getModuleChallenges(
    userId: string, 
    moduleType: ModuleType
  ): Promise<{ active: any[], completed: any[], available: any[] }> {
    try {
      // Get active challenges for this user and module
      const activeChallenges = await prisma.userChallenge.findMany({
        where: {
          userId,
          status: {
            in: ['ASSIGNED', 'IN_PROGRESS']
          },
          challenge: {
            isActive: true,
            // Filter by module type using existing fields
            OR: [
              { requiresJournaling: moduleType === 'JOURNALING' },
              { requiresMeditation: moduleType === 'MEDITATION' },
              { requiresMusic: moduleType === 'MUSIC' },
              { requiresPsychoeducation: moduleType === 'ARTICLE' }
            ]
          }
        },
        include: {
          challenge: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Get completed challenges
      const completedChallenges = await prisma.userChallenge.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          challenge: {
            isActive: true,
            OR: [
              { requiresJournaling: moduleType === 'JOURNALING' },
              { requiresMeditation: moduleType === 'MEDITATION' },
              { requiresMusic: moduleType === 'MUSIC' },
              { requiresPsychoeducation: moduleType === 'ARTICLE' }
            ]
          }
        },
        include: {
          challenge: true
        },
        orderBy: {
          completedAt: 'desc'
        },
        take: 10
      });

      // Get available challenges (not started yet)
      const userChallengeIds = [...activeChallenges, ...completedChallenges].map(uc => uc.challengeId);
      const availableChallenges = await prisma.challenge.findMany({
        where: {
          isActive: true,
          id: {
            notIn: userChallengeIds
          },
          OR: [
            { requiresJournaling: moduleType === 'JOURNALING' },
            { requiresMeditation: moduleType === 'MEDITATION' },
            { requiresMusic: moduleType === 'MUSIC' },
            { requiresPsychoeducation: moduleType === 'ARTICLE' }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transform challenges to match expected format
      const transformChallenge = (challenge: any) => ({
        ...challenge,
        moduleType: this.getModuleTypeFromFields(challenge),
        challengeType: this.getChallengeTypeFromName(challenge.name),
        targetValue: this.extractTargetValue(challenge),
        targetUnit: this.extractTargetUnit(challenge),
        rewardPoints: 10, // Default reward points since field doesn't exist in existing schema
        difficulty: this.getDifficultyFromName(challenge.name)
      });

      return {
        active: (activeChallenges || []).map(uc => ({
          ...uc,
          challenge: transformChallenge(uc.challenge),
          currentProgress: uc.progressPercentage || 0,
          progressPercentage: uc.progressPercentage || 0
        })),
        completed: (completedChallenges || []).map(uc => ({
          ...uc,
          challenge: transformChallenge(uc.challenge),
          currentProgress: 100,
          progressPercentage: 100
        })),
        available: (availableChallenges || []).map(transformChallenge)
      };
    } catch (error) {
      console.error('Error getting module challenges:', error);
      // Fallback to mock data if database fails
      const mockData = this.getMockChallenges(moduleType);
      return {
        active: mockData,
        completed: [],
        available: []
      };
    }
  }

  /**
   * Helper methods to transform existing challenge data to new format
   */
  private static getModuleTypeFromFields(challenge: any): ModuleType {
    if (challenge.requiresJournaling) return ModuleType.JOURNALING;
    if (challenge.requiresMeditation) return ModuleType.MEDITATION;
    if (challenge.requiresMusic) return ModuleType.MUSIC;
    if (challenge.requiresPsychoeducation) return ModuleType.ARTICLE;
    return ModuleType.JOURNALING; // Default
  }

  private static getChallengeTypeFromName(name: string): string {
    if (name.toLowerCase().includes('daily')) return 'DAILY';
    if (name.toLowerCase().includes('weekly')) return 'WEEKLY';
    if (name.toLowerCase().includes('streak')) return 'STREAK';
    if (name.toLowerCase().includes('milestone') || name.toLowerCase().includes('total')) return 'MILESTONE';
    return 'DAILY'; // Default
  }

  private static extractTargetValue(challenge: any): number {
    // Extract target value from challenge name or description
    const match = challenge.name?.match(/\d+/) || challenge.description?.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }

  private static extractTargetUnit(challenge: any): string {
    if (challenge.requiresJournaling) return 'ENTRIES';
    if (challenge.requiresMeditation) return 'SESSIONS';
    if (challenge.requiresMusic) return 'SESSIONS';
    if (challenge.requiresPsychoeducation) return 'ARTICLES';
    return 'ENTRIES'; // Default
  }

  private static getDifficultyFromName(name: string): string {
    if (name.toLowerCase().includes('advanced')) return 'ADVANCED';
    if (name.toLowerCase().includes('intermediate')) return 'INTERMEDIATE';
    return 'BEGINNER'; // Default
  }

  /**
   * Get mock challenges for testing (fallback)
   */
  private static getMockChallenges(moduleType: ModuleType): any[] {
    const baseChallenges: Record<ModuleType, any[]> = {
      JOURNALING: [
        {
          id: 'journal_daily_1',
          title: 'Write 1 Journal Entry',
          description: 'Complete a journal entry today to express your thoughts and feelings',
          moduleType: 'JOURNALING',
          challengeType: 'DAILY',
          targetValue: 1,
          targetUnit: 'ENTRIES',
          rewardPoints: 10,
          difficulty: 'BEGINNER'
        }
      ],
      MEDITATION: [
        {
          id: 'med_daily_10',
          title: 'Meditate for 10 Minutes',
          description: 'Complete a 10-minute meditation session',
          moduleType: 'MEDITATION',
          challengeType: 'DAILY',
          targetValue: 10,
          targetUnit: 'MINUTES',
          rewardPoints: 15,
          difficulty: 'BEGINNER'
        }
      ],
      MUSIC: [
        {
          id: 'music_daily_15',
          title: 'Listen to Music for 15 Minutes',
          description: 'Listen to calming music for 15 minutes',
          moduleType: 'MUSIC',
          challengeType: 'DAILY',
          targetValue: 15,
          targetUnit: 'MINUTES',
          rewardPoints: 10,
          difficulty: 'BEGINNER'
        }
      ],
      ARTICLE: [
        {
          id: 'article_daily_1',
          title: 'Read 1 Article',
          description: 'Read an article to learn something new',
          moduleType: 'ARTICLE',
          challengeType: 'DAILY',
          targetValue: 1,
          targetUnit: 'ARTICLES',
          rewardPoints: 10,
          difficulty: 'BEGINNER'
        }
      ]
    };

    return baseChallenges[moduleType] || [];
  }

  /**
   * Get user profile with gamification stats using existing schema
   */
  static async getUserProfile(userId: string): Promise<any> {
    try {
      // Get user's completed challenges count
      const completedChallengesCount = await prisma.userChallenge.count({
        where: {
          userId,
          status: 'COMPLETED'
        }
      });

      // Get user's earned badges
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: true
        },
        orderBy: {
          earnedAt: 'desc'
        }
      });

      // Get user's streak data
      const streak = await prisma.streak.findUnique({
        where: { userId }
      });

      // Calculate mock XP based on completed challenges and badges
      const totalXp = (completedChallengesCount * 50) + (userBadges.length * 25);
      const currentLevel = Math.floor(totalXp / 100) + 1;

      const profile = {
        userId,
        totalXp: totalXp || 0,
        currentLevel: currentLevel || 1,
        currentStreak: streak?.count || 0,
        longestStreak: streak?.bestStreak || 0,
        challengesCompleted: completedChallengesCount || 0,
        badgesEarned: (userBadges || []).length,
        earnedBadges: (userBadges || []).map(ub => ({
          ...ub,
          badge: {
            ...ub.badge,
            category: ub.badge.type || 'GENERAL'
          }
        }))
      };

      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      // Fallback to mock profile data if database fails
      return {
        userId,
        totalXp: 150,
        currentLevel: 2,
        currentStreak: 3,
        longestStreak: 7,
        challengesCompleted: 5,
        badgesEarned: 2,
        earnedBadges: [
          {
            id: 'badge_1',
            badgeId: 'first_journal',
            userId,
            earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            badge: {
              id: 'first_journal',
              name: 'First Journal',
              description: 'Completed your first journal entry',
              category: 'JOURNALING'
            }
          }
        ]
      };
    }
  }

  /**
   * Get challenge dashboard data
   */
  static async getChallengeDashboard(userId: string): Promise<any> {
    const [
      journaling,
      meditation,
      music,
      article,
      profile
    ] = await Promise.all([
      this.getModuleChallenges(userId, ModuleType.JOURNALING),
      this.getModuleChallenges(userId, ModuleType.MEDITATION),
      this.getModuleChallenges(userId, ModuleType.MUSIC),
      this.getModuleChallenges(userId, ModuleType.ARTICLE),
      this.getUserProfile(userId)
    ]);

    return {
      journaling,
      meditation,
      music,
      article,
      profile,
      stats: {
        totalActiveChallenges: (journaling.active?.length || 0) + (meditation.active?.length || 0) + 
                               (music.active?.length || 0) + (article.active?.length || 0),
        totalCompletedChallenges: profile.challengesCompleted || 0,
        totalXp: profile.totalXp || 0,
        currentLevel: profile.currentLevel || 1,
        badgesEarned: profile.badgesEarned || 0,
        currentStreak: profile.currentStreak || 0
      }
    };
  }
}
