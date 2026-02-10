import { DatabaseService } from '@/src/lib/database/database-service'
import { ValidationError } from '@/src/lib/errors/custom-errors'

export interface TriggerSelectionData {
  studentId: string
  triggers: string[]
}

export interface TriggerAnalytics {
  totalSelections: number
  triggerFrequency: Record<string, number>
  commonCombinations: string[][]
  recentTrends: string[]
}

export class TriggerService {
  /**
   * Create trigger selections for a student
   */
  static async createTriggerSelection(triggerData: TriggerSelectionData): Promise<any> {
    try {
      // Validate triggers
      if (!triggerData.triggers || triggerData.triggers.length === 0) {
        throw new ValidationError('At least one trigger must be selected')
      }

      // Create trigger selections
      const selections = await DatabaseService.createTriggerSelection({
        studentId: triggerData.studentId,
        triggers: triggerData.triggers
      })
      
      return selections
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new Error(`Failed to create trigger selections: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get trigger history for a student
   */
  static async getTriggerHistory(studentId: string, limit: number = 30): Promise<any[]> {
    try {
      return await DatabaseService.getStudentTriggerHistory(studentId, limit)
    } catch (error) {
      throw new Error(`Failed to get trigger history: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get trigger analytics for a student
   */
  static async getTriggerAnalytics(studentId: string): Promise<TriggerAnalytics> {
    try {
      const triggerHistory = await DatabaseService.getStudentTriggerHistory(studentId, 100)
      
      if (triggerHistory.length === 0) {
        return {
          totalSelections: 0,
          triggerFrequency: {},
          commonCombinations: [],
          recentTrends: []
        }
      }

      // Calculate trigger frequency
      const triggerFrequency: Record<string, number> = {}
      const allCombinations: string[][] = []

      triggerHistory.forEach(selection => {
        selection.triggers.forEach((trigger: string) => {
          triggerFrequency[trigger] = (triggerFrequency[trigger] || 0) + 1
        })
        
        if (selection.triggers.length > 1) {
          allCombinations.push([...selection.triggers].sort())
        }
      })

      // Get common combinations
      const combinationFrequency: Record<string, number> = {}
      allCombinations.forEach(combination => {
        const key = combination.join('+')
        combinationFrequency[key] = (combinationFrequency[key] || 0) + 1
      })

      const commonCombinations = Object.entries(combinationFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([combination]) => combination.split('+'))

      // Get recent trends (last 5 selections)
      const recentTrends = triggerHistory
        .slice(0, 5)
        .flatMap(selection => selection.triggers)

      return {
        totalSelections: triggerHistory.length,
        triggerFrequency,
        commonCombinations,
        recentTrends
      }
    } catch (error) {
      throw new Error(`Failed to get trigger analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get available trigger options
   */
  static getAvailableTriggers(): string[] {
    return [
      'Stress',
      'Anxiety',
      'Depression',
      'Relationship Issues',
      'Work/Study Pressure',
      'Family Problems',
      'Financial Stress',
      'Health Concerns',
      'Loneliness',
      'Sleep Problems',
      'Self-Esteem Issues',
      'Trauma',
      'Addiction',
      'Grief',
      'Life Changes',
      'Social Pressure',
      'Perfectionism',
      'Burnout',
      'Uncertainty about Future',
      'Other'
    ]
  }

  /**
   * Get personalized trigger recommendations based on history
   */
  static async getTriggerRecommendations(studentId: string): Promise<{
    recommended: string[]
    avoid: string[]
    insights: string[]
  }> {
    try {
      const analytics = await this.getTriggerAnalytics(studentId)
      
      if (analytics.totalSelections === 0) {
        return {
          recommended: ['Stress', 'Anxiety', 'Work/Study Pressure'],
          avoid: [],
          insights: ['Start tracking your triggers to get personalized recommendations']
        }
      }

      const allTriggers = this.getAvailableTriggers()
      const selectedTriggers = Object.keys(analytics.triggerFrequency)
      
      // Get frequently selected triggers
      const frequentTriggers = Object.entries(analytics.triggerFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([trigger]) => trigger)

      // Get rarely selected but common triggers
      const commonButNotSelected = allTriggers.filter(trigger => 
        !selectedTriggers.includes(trigger) && 
        ['Stress', 'Anxiety', 'Work/Study Pressure', 'Relationship Issues', 'Sleep Problems'].includes(trigger)
      )

      // Generate insights
      const insights: string[] = []
      
      if (analytics.triggerFrequency['Stress'] > analytics.totalSelections * 0.5) {
        insights.push('Stress appears to be a recurring trigger. Consider stress management techniques.')
      }
      
      if (analytics.triggerFrequency['Anxiety'] > analytics.totalSelections * 0.3) {
        insights.push('Anxiety is frequently selected. Mindfulness exercises might help.')
      }

      if (analytics.commonCombinations.length > 0) {
        const topCombination = analytics.commonCombinations[0].join(' and ')
        insights.push(`You often experience ${topCombination} together.`)
      }

      return {
        recommended: frequentTriggers,
        avoid: [], // We don't want to discourage any trigger selection
        insights
      }
    } catch (error) {
      throw new Error(`Failed to get trigger recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get coping strategies for specific triggers
   */
  static getCopingStrategies(triggers: string[]): string[] {
    const strategies: Record<string, string[]> = {
      'Stress': [
        'Practice deep breathing exercises',
        'Take regular breaks during work/study',
        'Try progressive muscle relaxation',
        'Engage in physical activity'
      ],
      'Anxiety': [
        'Practice mindfulness meditation',
        'Use the 5-4-3-2-1 grounding technique',
        'Challenge anxious thoughts',
        'Limit caffeine intake'
      ],
      'Depression': [
        'Maintain a regular sleep schedule',
        'Engage in activities you used to enjoy',
        'Reach out to friends or family',
        'Consider professional help'
      ],
      'Relationship Issues': [
        'Practice active listening',
        'Use "I" statements to express feelings',
        'Set healthy boundaries',
        'Consider couples counseling'
      ],
      'Work/Study Pressure': [
        'Break tasks into smaller steps',
        'Use time management techniques',
        'Take regular breaks',
        'Practice saying "no" to extra commitments'
      ],
      'Sleep Problems': [
        'Maintain a consistent sleep schedule',
        'Avoid screens before bedtime',
        'Create a relaxing bedtime routine',
        'Limit caffeine in the evening'
      ]
    }

    const allStrategies: string[] = []
    
    triggers.forEach(trigger => {
      const triggerStrategies = strategies[trigger]
      if (triggerStrategies) {
        allStrategies.push(...triggerStrategies)
      }
    })

    // Remove duplicates and return
    return [...new Set(allStrategies)]
  }

  /**
   * Update trigger selection
   */
  static async updateTriggerSelection(selectionId: string, studentId: string, triggers: string[]): Promise<any> {
    try {
      // Verify selection belongs to student
      const existingSelection = await DatabaseService.getTriggerSelection(selectionId)
      
      if (!existingSelection || existingSelection.studentId !== studentId) {
        throw new ValidationError('Trigger selection not found')
      }
      
      return await DatabaseService.updateTriggerSelection(selectionId, { triggers })
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new Error(`Failed to update trigger selection: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete trigger selection
   */
  static async deleteTriggerSelection(selectionId: string, studentId: string): Promise<void> {
    try {
      // Verify selection belongs to student
      const existingSelection = await DatabaseService.getTriggerSelection(selectionId)
      
      if (!existingSelection || existingSelection.studentId !== studentId) {
        throw new ValidationError('Trigger selection not found')
      }
      
      await DatabaseService.deleteTriggerSelection(selectionId)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new Error(`Failed to delete trigger selection: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
