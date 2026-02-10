// import { URLSearchParams } from 'url'

export interface ChatSearchParams {
  mood?: string
  triggers?: string[]
  notes?: string
  moodCheckinId?: string
  triggerId?: string
}

export class SearchParamsUtils {
  /**
   * Extract chat-related search parameters from URL
   */
  static extractChatParams(searchParams: URLSearchParams): ChatSearchParams {
    return {
      mood: searchParams.get('mood') || undefined,
      triggers: searchParams.get('triggers')?.split(',').filter(Boolean) || [],
      notes: searchParams.get('notes') || undefined,
      moodCheckinId: searchParams.get('moodCheckinId') || undefined,
      triggerId: searchParams.get('triggerId') || undefined,
    }
  }

  /**
   * Create search parameters for chat navigation
   */
  static createChatParams(data: ChatSearchParams): string {
    const params = new URLSearchParams()
    
    if (data.mood) params.set('mood', data.mood)
    if (data.triggers?.length) params.set('triggers', data.triggers.join(','))
    if (data.notes) params.set('notes', data.notes)
    if (data.moodCheckinId) params.set('moodCheckinId', data.moodCheckinId)
    if (data.triggerId) params.set('triggerId', data.triggerId)
    
    return params.toString()
  }

  /**
   * Validate required chat parameters
   */
  static validateChatParams(params: ChatSearchParams): {
    isValid: boolean
    missing: string[]
  } {
    const missing: string[] = []
    
    if (!params.mood) missing.push('mood')
    if (!params.triggers?.length) missing.push('triggers')
    
    return {
      isValid: missing.length === 0,
      missing
    }
  }
}
