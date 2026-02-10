import { DatabaseService } from '@/src/lib/database/database-service'
import { ValidationError } from '@/src/lib/errors/custom-errors'

export interface MoodCheckinData {
  studentId: string
  mood: string
  triggers?: string[]
  notes?: string
}

export interface MoodAnalytics {
  totalCheckins: number
  moodDistribution: Record<string, number>
  averageMoodScore: number
  recentTrend: string[]
}

export class MoodService {
  /**
   * Create a new mood checkin for a student
   */
  static async createMoodCheckin(checkinData: MoodCheckinData): Promise<any> {
    try {
      // Check if student already checked in today
      const existingCheckin = await DatabaseService.checkTodayMoodCheckin(checkinData.studentId)
      
      if (existingCheckin) {
        throw new ValidationError('Already checked in today')
      }
      
      // Create new mood checkin
      const checkin = await DatabaseService.createMoodCheckin({
        studentId: checkinData.studentId,
        mood: checkinData.mood,
        notes: checkinData.notes
      })

      // Save triggers if provided
      if (checkinData.triggers && checkinData.triggers.length > 0) {
        await DatabaseService.createTriggerSelection({
          studentId: checkinData.studentId,
          triggers: checkinData.triggers,
          notes: checkinData.notes
        })
      }
      
      return checkin
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new Error(`Failed to create mood checkin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get mood history for a student
   */
  static async getMoodHistory(studentId: string, limit: number = 30): Promise<any[]> {
    try {
      return await DatabaseService.getStudentMoodHistory(studentId, limit)
    } catch (error) {
      throw new Error(`Failed to get mood history: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get mood analytics for a student
   */
  static async getMoodAnalytics(studentId: string): Promise<MoodAnalytics> {
    try {
      const moodHistory = await DatabaseService.getStudentMoodHistory(studentId, 100)
      
      if (moodHistory.length === 0) {
        return {
          totalCheckins: 0,
          moodDistribution: {},
          averageMoodScore: 0,
          recentTrend: []
        }
      }

      // Calculate mood distribution
      const moodDistribution: Record<string, number> = {}
      let totalScore = 0
      
      const moodScores: Record<string, number> = {
        'Happy': 5,
        'Okay': 4,
        'Sad': 2,
        'Anxious': 1,
        'Tired': 3
      }

      moodHistory.forEach(checkin => {
        const mood = checkin.mood
        moodDistribution[mood] = (moodDistribution[mood] || 0) + 1
        totalScore += moodScores[mood] || 3
      })

      // Calculate recent trend (last 7 days)
      const recentTrend = moodHistory
        .slice(0, 7)
        .map(checkin => checkin.mood)

      return {
        totalCheckins: moodHistory.length,
        moodDistribution,
        averageMoodScore: totalScore / moodHistory.length,
        recentTrend
      }
    } catch (error) {
      throw new Error(`Failed to get mood analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get today's mood checkin for a student
   */
  static async getTodayCheckin(studentId: string): Promise<any | null> {
    try {
      return await DatabaseService.checkTodayMoodCheckin(studentId)
    } catch (error) {
      throw new Error(`Failed to get today's checkin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update mood checkin
   */
  static async updateMoodCheckin(checkinId: string, studentId: string, updateData: Partial<MoodCheckinData>): Promise<any> {
    try {
      // Verify checkin belongs to student
      const existingCheckin = await DatabaseService.getMoodCheckin(checkinId)
      
      if (!existingCheckin || existingCheckin.studentId !== studentId) {
        throw new ValidationError('Mood checkin not found')
      }
      
      return await DatabaseService.updateMoodCheckin(checkinId, updateData)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new Error(`Failed to update mood checkin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete mood checkin
   */
  static async deleteMoodCheckin(checkinId: string, studentId: string): Promise<void> {
    try {
      // Verify checkin belongs to student
      const existingCheckin = await DatabaseService.getMoodCheckin(checkinId)
      
      if (!existingCheckin || existingCheckin.studentId !== studentId) {
        throw new ValidationError('Mood checkin not found')
      }
      
      await DatabaseService.deleteMoodCheckin(checkinId)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new Error(`Failed to delete mood checkin: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get mood recommendations based on current mood
   */
  static getMoodRecommendations(mood: string): string[] {
    const recommendations: Record<string, string[]> = {
      'Happy': [
        'Keep up the positive energy! Consider journaling what made you happy today.',
        'Share your happiness with others - it\'s contagious!',
        'Take a moment to appreciate this feeling and what led to it.'
      ],
      'Okay': [
        'Try a quick 5-minute meditation to center yourself.',
        'Consider what small thing could make your day better.',
        'Take a short walk to clear your mind.'
      ],
      'Sad': [
        'It\'s okay to feel sad. Consider talking to someone you trust.',
        'Try engaging in a comforting activity like listening to music or reading.',
        'Remember that feelings are temporary and will pass.'
      ],
      'Anxious': [
        'Try deep breathing exercises: inhale for 4 counts, hold for 4, exhale for 4.',
        'Write down what\'s making you anxious to get it out of your head.',
        'Focus on the present moment - what can you control right now?'
      ],
      'Tired': [
        'Consider if you need more rest or sleep.',
        'Try gentle stretching to boost your energy.',
        'Stay hydrated and consider a healthy snack.'
      ]
    }

    return recommendations[mood] || [
      'Take a moment to check in with yourself.',
      'Consider what you need right now.',
      'Be kind to yourself - you\'re doing your best.'
    ]
  }
}
