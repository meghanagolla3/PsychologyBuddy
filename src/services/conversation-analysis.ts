export interface Message {
  id: string
  sender: 'student' | 'bot'
  content: string
  timestamp: string
}

export interface ConversationAnalysis {
  shouldEnd: boolean
  reason: string
  completionScore: number
  nextSteps: string[]
  emotionalProgress: {
    initialMood?: string
    currentMood?: string
    improvement: boolean
  }
  conversationQuality: {
    depth: 'shallow' | 'moderate' | 'deep'
    engagement: 'low' | 'medium' | 'high'
    resolution: 'none' | 'partial' | 'complete'
  }
}

export class ConversationAnalyzer {
  static async analyzeConversation(
    messages: Message[],
    sessionId: string
  ): Promise<ConversationAnalysis> {
    const analysis: ConversationAnalysis = {
      shouldEnd: false,
      reason: '',
      completionScore: 0,
      nextSteps: [],
      emotionalProgress: {
        improvement: false
      },
      conversationQuality: {
        depth: 'shallow',
        engagement: 'low',
        resolution: 'none'
      }
    }
    
    // Check conversation length
    const messageCount = messages.length
    if (messageCount < 5) {
      return analysis // Too short to end
    }
    
    // Analyze recent messages for completion indicators
    const recentMessages = messages.slice(-5)
    const lastUserMessage = messages.filter(m => m.sender === 'student').pop()
    const allUserMessages = messages.filter(m => m.sender === 'student')
    
    // Enhanced ending indicators (more empathetic language)
    const endingIndicators = [
      'thank you', 'thanks', 'feel better', 'helped me', 
      'understand now', 'clear', 'resolved', 'goodbye',
      'i feel better', 'that makes sense', 'i understand',
      'that helps', 'good advice', 'will try that',
      'feel supported', 'feel heard', 'appreciate this',
      'thanks for listening', 'feel more hopeful'
    ]
    
    const hasEndingIndicator = endingIndicators.some(indicator =>
      lastUserMessage?.content.toLowerCase().includes(indicator)
    )
    
    // Enhanced resolution indicators
    const resolutionIndicators = [
      'i feel better', 'that makes sense', 'i understand',
      'that helps', 'good advice', 'will try that',
      'feel more confident', 'know what to do', 'have a plan',
      'feel ready', 'feel prepared', 'can handle this'
    ]
    
    const hasResolution = resolutionIndicators.some(indicator =>
      lastUserMessage?.content.toLowerCase().includes(indicator)
    )
    
    // Analyze conversation depth
    const avgMessageLength = allUserMessages.reduce((sum, msg) => sum + msg.content.length, 0) / allUserMessages.length
    const hasReflectiveLanguage = allUserMessages.some(msg => 
      msg.content.toLowerCase().includes('i feel') || 
      msg.content.toLowerCase().includes('i think') ||
      msg.content.toLowerCase().includes('i realize')
    )
    
    if (avgMessageLength > 100 && hasReflectiveLanguage) {
      analysis.conversationQuality.depth = 'deep'
    } else if (avgMessageLength > 50) {
      analysis.conversationQuality.depth = 'moderate'
    }
    
    // Analyze engagement level
    const studentMessageCount = allUserMessages.length
    if (studentMessageCount >= 8) {
      analysis.conversationQuality.engagement = 'high'
    } else if (studentMessageCount >= 4) {
      analysis.conversationQuality.engagement = 'medium'
    }
    
    // Analyze emotional progress (simple keyword-based)
    const negativeWords = ['sad', 'angry', 'anxious', 'stressed', 'worried', 'upset', 'hurt']
    const positiveWords = ['better', 'good', 'hopeful', 'confident', 'calm', 'relieved', 'happy']
    
    const firstMessage = allUserMessages[0]?.content.toLowerCase() || ''
    const lastMessage = lastUserMessage?.content.toLowerCase() || ''
    
    const initialNegative = negativeWords.some(word => firstMessage.includes(word))
    const lastPositive = positiveWords.some(word => lastMessage.includes(word))
    
    if (initialNegative && lastPositive) {
      analysis.emotionalProgress.improvement = true
    }
    
    // Determine resolution level
    if (hasResolution && analysis.conversationQuality.depth === 'deep') {
      analysis.conversationQuality.resolution = 'complete'
    } else if (hasResolution || analysis.conversationQuality.depth === 'moderate') {
      analysis.conversationQuality.resolution = 'partial'
    }
    
    // Enhanced completion score calculation
    let score = 0
    if (messageCount >= 10) score += 20
    if (messageCount >= 20) score += 10
    if (hasEndingIndicator) score += 25
    if (hasResolution) score += 20
    if (analysis.conversationQuality.depth === 'deep') score += 15
    if (analysis.conversationQuality.engagement === 'high') score += 10
    if (analysis.emotionalProgress.improvement) score += 10
    if (analysis.conversationQuality.resolution === 'complete') score += 15
    
    analysis.completionScore = Math.min(score, 100) // Cap at 100
    
    // Determine if conversation should end with more nuanced reasons
    if (score >= 70) {
      analysis.shouldEnd = true
      
      if (hasEndingIndicator && hasResolution) {
        analysis.reason = 'Natural conversation ending with clear resolution'
      } else if (hasEndingIndicator) {
        analysis.reason = 'Student expressed gratitude and satisfaction'
      } else if (hasResolution) {
        analysis.reason = 'Student achieved understanding and has action plan'
      } else if (analysis.emotionalProgress.improvement) {
        analysis.reason = 'Positive emotional progress achieved'
      } else {
        analysis.reason = 'Conversation appears complete and productive'
      }
    }
    
    // Generate next steps based on analysis
    if (analysis.shouldEnd) {
      if (analysis.conversationQuality.resolution === 'partial') {
        analysis.nextSteps.push('Consider following up on unresolved aspects in next session')
      }
      if (analysis.emotionalProgress.improvement) {
        analysis.nextSteps.push('Acknowledge positive progress in summary')
      }
    } else {
      if (analysis.conversationQuality.depth === 'shallow') {
        analysis.nextSteps.push('Encourage deeper reflection on feelings')
      }
      if (analysis.conversationQuality.engagement === 'low') {
        analysis.nextSteps.push('Use gentle questions to increase engagement')
      }
    }
    
    return analysis
  }
}
