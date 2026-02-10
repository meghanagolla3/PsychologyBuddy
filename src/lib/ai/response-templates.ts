export interface StructuredResponse {
  greeting?: string
  reflection: string 
  support: string    
  question: string   
}

export interface ResourceLink {
  name: string
  description: string
  link: string
}

export class ResponseFormatter {
  static formatStructuredResponse(response: StructuredResponse): string {
    let formatted = ''
    
    // 1. Warm Greeting (if it's a new session)
    if (response.greeting) {
      formatted += `${response.greeting}\n\n` 
    }
    
    // 2. The Reflection & Support (combined for flow)
    // We avoid bold headers like "Key Points" to keep it feeling human
    formatted += `${response.reflection}\n\n` 
    formatted += `${response.support}\n\n` 
    
    // 3. The Single Question
    // Using a simple emoji separator instead of a bold header
    formatted += `✨ ${response.question}` 
    
    return formatted.trim()
  }

  // Legacy method for backward compatibility - converts old format to new
  static formatLegacyResponse(legacyResponse: {
    greeting?: string
    mainPoints: string[]
    questions?: string[]
    closing?: string
  }): string {
    const newResponse: StructuredResponse = {
      greeting: legacyResponse.greeting,
      reflection: legacyResponse.mainPoints[0] || '',
      support: legacyResponse.mainPoints[1] || legacyResponse.closing || '',
      question: legacyResponse.questions?.[0] || ''
    }
    return this.formatStructuredResponse(newResponse)
  }
}
