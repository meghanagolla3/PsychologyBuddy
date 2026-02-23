export interface EscalationLevel {
  level: 'low' | 'medium' | 'high' | 'critical'
  severity: number // 1-10 scale
  requiresImmediateAction: boolean
}

export interface EscalationCategory {
  type: 'self_harm' | 'violence' | 'abuse' | 'substance_abuse' | 'mental_health_crisis' | 'behavioral_concern' | 'other'
  confidence: number // 0-1 scale
}

export interface EscalationDetection {
  isEscalation: boolean
  category: EscalationCategory
  level: EscalationLevel
  detectedPhrases: string[]
  context: string
  recommendation: string
  timestamp: string
}

export interface EscalationAlert {
  id: string
  studentId: string
  sessionId: string
  detection: EscalationDetection
  messageContent: string
  messageTimestamp: string
  status: 'pending' | 'reviewed' | 'resolved' | 'false_positive'
  assignedTo?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export class ContentEscalationDetector {
  // Keywords and patterns for different escalation categories
  private static readonly ESCALATION_PATTERNS = {
    self_harm: {
      keywords: [
        'kill myself', 'want to die', 'end my life', 'suicide', 'suicidal',
        'hurt myself', 'self harm', 'cut myself', 'end it all', 'better off dead',
        'no reason to live', 'want to disappear', 'take my own life'
      ],
      weight: 10,
      immediateAction: true
    },
    violence: {
      keywords: [
        'kill someone', 'hurt someone', 'want to kill', 'violence', 'weapon',
        'revenge', 'payback', 'make them pay', 'harm others', 'attack someone'
      ],
      weight: 9,
      immediateAction: true
    },
    abuse: {
      keywords: [
        'abuse', 'molest', 'rape', 'assault', 'harassment', 'bullying',
        'someone hurts me', 'being abused', 'unsafe at home', 'someone touches me'
      ],
      weight: 8,
      immediateAction: true
    },
    substance_abuse: {
      keywords: [
        'addiction', 'overdose', 'drugs', 'alcohol', 'substance abuse',
        'can\'t stop using', 'addicted to', 'withdrawal', 'using too much'
      ],
      weight: 6,
      immediateAction: false
    },
    mental_health_crisis: {
      keywords: [
        'breakdown', 'crisis', 'emergency', 'can\'t cope', 'losing control',
        'mental breakdown', 'psychotic', 'hallucination', 'delusional'
      ],
      weight: 7,
      immediateAction: true
    },
    behavioral_concern: {
      keywords: [
        'out of control', 'can\'t control myself', 'losing it', 'angry all the time',
        'rage', 'violent thoughts', 'hate everyone', 'want to scream'
      ],
      weight: 5,
      immediateAction: false
    }
  }

  // Contextual patterns that increase severity
  private static readonly CONTEXTUAL_ENHANCERS = [
    'right now', 'tonight', 'today', 'planning to', 'going to', 'decided to',
    'have a plan', 'know how', 'ready to', 'finally', 'can\'t take anymore'
  ]

  // Diminishers that might reduce severity (but not eliminate)
  private static readonly DIMINISHERS = [
    'sometimes i feel', 'used to think', 'joking', 'kidding', 'metaphor',
    'figure of speech', 'hypothetically', 'if i were'
  ]

  /**
   * Analyzes message content for escalation indicators
   */
  static async analyzeMessage(
    message: string,
    studentId: string,
    sessionId: string,
    conversationContext?: string[]
  ): Promise<EscalationDetection> {
    const normalizedMessage = message.toLowerCase().trim()
    
    // Initialize detection result
    const detection: EscalationDetection = {
      isEscalation: false,
      category: {
        type: 'other',
        confidence: 0
      },
      level: {
        level: 'low',
        severity: 0,
        requiresImmediateAction: false
      },
      detectedPhrases: [],
      context: '',
      recommendation: '',
      timestamp: new Date().toISOString()
    }

    // Check each escalation category
    for (const [categoryType, patterns] of Object.entries(this.ESCALATION_PATTERNS)) {
      const matches = this.findKeywordMatches(normalizedMessage, patterns.keywords)
      
      if (matches.length > 0) {
        const confidence = this.calculateConfidence(normalizedMessage, matches, patterns.keywords)
        const severity = this.calculateSeverity(confidence, patterns.weight, message)
        
        // Update detection if this is more severe than previous findings
        if (severity > detection.level.severity) {
          detection.isEscalation = true
          detection.category = {
            type: categoryType as EscalationCategory['type'],
            confidence
          }
          detection.level = this.determineEscalationLevel(severity, patterns.immediateAction)
          detection.detectedPhrases = matches
          detection.context = this.extractContext(message, conversationContext)
          detection.recommendation = this.generateRecommendation(detection.category.type, detection.level.level)
        }
      }
    }

    return detection
  }

  /**
   * Finds keyword matches in the message
   */
  private static findKeywordMatches(message: string, keywords: string[]): string[] {
    const matches: string[] = []
    
    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        matches.push(keyword)
      }
    }
    
    return matches
  }

  /**
   * Calculates confidence score based on matches and context
   */
  private static calculateConfidence(
    message: string,
    matches: string[],
    allKeywords: string[]
  ): number {
    let confidence = matches.length / allKeywords.length
    
    // Boost confidence if contextual enhancers are present
    const hasEnhancers = this.CONTEXTUAL_ENHANCERS.some(enhancer => 
      message.includes(enhancer)
    )
    if (hasEnhancers) {
      confidence = Math.min(confidence * 1.5, 1.0)
    }
    
    // Reduce confidence if diminishers are present
    const hasDiminishers = this.DIMINISHERS.some(diminisher => 
      message.includes(diminisher)
    )
    if (hasDiminishers) {
      confidence *= 0.6
    }
    
    return Math.min(confidence, 1.0)
  }

  /**
   * Calculates severity score
   */
  private static calculateSeverity(
    confidence: number,
    categoryWeight: number,
    message: string
  ): number {
    let severity = confidence * categoryWeight
    
    // Increase severity for explicit plans or immediate intent
    const immediateIndicators = ['going to', 'planning to', 'ready to', 'tonight', 'today']
    const hasImmediateIntent = immediateIndicators.some(indicator => 
      message.toLowerCase().includes(indicator)
    )
    
    if (hasImmediateIntent) {
      severity = Math.min(severity * 1.3, 10)
    }
    
    return Math.round(severity * 10) / 10 // Round to 1 decimal place
  }

  /**
   * Determines escalation level based on severity
   */
  private static determineEscalationLevel(
    severity: number,
    requiresImmediateAction: boolean
  ): EscalationLevel {
    if (severity >= 8 || requiresImmediateAction) {
      return {
        level: 'critical',
        severity,
        requiresImmediateAction: true
      }
    } else if (severity >= 6) {
      return {
        level: 'high',
        severity,
        requiresImmediateAction: true
      }
    } else if (severity >= 4) {
      return {
        level: 'medium',
        severity,
        requiresImmediateAction: false
      }
    } else {
      return {
        level: 'low',
        severity,
        requiresImmediateAction: false
      }
    }
  }

  /**
   * Extracts relevant context from conversation
   */
  private static extractContext(currentMessage: string, conversationContext?: string[]): string {
    if (!conversationContext || conversationContext.length === 0) {
      return currentMessage
    }
    
    // Get last 2-3 messages for context
    const recentMessages = conversationContext.slice(-3).join(' ')
    return `${recentMessages} → ${currentMessage}`
  }

  /**
   * Generates recommendation based on escalation type and level
   */
  private static generateRecommendation(
    category: EscalationCategory['type'],
    level: EscalationLevel['level']
  ): string {
    const recommendations: Record<EscalationCategory['type'], Record<EscalationLevel['level'], string>> = {
      self_harm: {
        critical: 'IMMEDIATE INTERVENTION REQUIRED - Contact emergency services and school counseling immediately',
        high: 'URGENT - Immediate counselor notification and parent contact required',
        medium: 'Schedule urgent counseling session and notify parents',
        low: 'Refer to school counselor for evaluation'
      },
      violence: {
        critical: 'IMMEDIATE INTERVENTION REQUIRED - Contact school administration and security',
        high: 'URGENT - Immediate administrator notification and parent contact required',
        medium: 'Schedule meeting with counselor and administrator',
        low: 'Refer to school counselor for assessment'
      },
      abuse: {
        critical: 'IMMEDIATE INTERVENTION REQUIRED - Contact child protective services and administration',
        high: 'URGENT - Mandatory reporting and counselor intervention required',
        medium: 'Schedule confidential meeting with counselor and report to authorities',
        low: 'Refer to school counselor for confidential discussion'
      },
      substance_abuse: {
        critical: 'IMMEDIATE INTERVENTION REQUIRED - Contact emergency services and parents',
        high: 'URGENT - Counselor intervention and parent notification required',
        medium: 'Schedule counseling session for substance abuse assessment',
        low: 'Monitor and refer to counselor if concerns persist'
      },
      mental_health_crisis: {
        critical: 'IMMEDIATE INTERVENTION REQUIRED - Contact emergency services and parents',
        high: 'URGENT - Immediate counselor and parent notification required',
        medium: 'Schedule urgent mental health evaluation',
        low: 'Refer to school counselor for mental health support'
      },
      behavioral_concern: {
        critical: 'IMMEDIATE INTERVENTION REQUIRED - Contact school administration and security',
        high: 'Schedule counselor meeting and notify parents',
        medium: 'Monitor behavior and refer to counselor if needed',
        low: 'Document and monitor for escalation'
      },
      other: {
        critical: 'IMMEDIATE INTERVENTION REQUIRED - Contact emergency services and administration',
        high: 'URGENT - Immediate counselor notification required',
        medium: 'Review by counselor recommended',
        low: 'Monitor conversation for further indicators'
      }
    }
    
    return recommendations[category]?.[level] || 'Review by school counselor recommended'
  }

  /**
   * Validates if a message should trigger escalation
   */
  static isValidEscalation(detection: EscalationDetection): boolean {
    // Always allow critical escalations regardless of confidence
    if (detection.level.level === 'critical') {
      return detection.isEscalation
    }
    
    // For non-critical, use normal thresholds
    return (
      detection.isEscalation &&
      detection.category.confidence > 0.3 &&
      (detection.level.severity >= 5 || detection.level.severity >= 0.5)
    )
  }

  /**
   * Gets escalation statistics for monitoring
   */
  static getEscalationStats(detections: EscalationDetection[]): {
    totalEscalations: number
    byCategory: Record<string, number>
    byLevel: Record<string, number>
    averageConfidence: number
  } {
    const stats = {
      totalEscalations: detections.length,
      byCategory: {} as Record<string, number>,
      byLevel: {} as Record<string, number>,
      averageConfidence: 0
    }

    if (detections.length === 0) return stats

    let totalConfidence = 0

    for (const detection of detections) {
      // Count by category
      const category = detection.category.type
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1

      // Count by level
      const level = detection.level.level
      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1

      totalConfidence += detection.category.confidence
    }

    stats.averageConfidence = totalConfidence / detections.length

    return stats
  }
}
