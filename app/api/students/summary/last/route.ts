import { createAPIHandler } from '@/src/lib/api'
import { SummaryService } from '@/src/services/chats'

export const dynamic = 'force-dynamic'

export const GET = createAPIHandler.get(
  async (params, context) => {
    const studentId = params.get('studentId')
    
    if (!studentId) {
      throw new Error('Student ID is required')
    }
    
    // Get the most recent summary for the student
    const recentSummary = await SummaryService.getRecentSummary(studentId)
    
    if (!recentSummary) {
      // Return success with null data instead of throwing error
      return {
        success: true,
        data: null
      }
    }
    
    // Return in the expected format with success wrapper
    return {
      success: true,
      data: {
        id: recentSummary.id,
        mainTopic: recentSummary.mainTopic,
        createdAt: recentSummary.createdAt.toISOString()
      }
    }
  },
  { requireAuth: false } // Disable auth for now
)
