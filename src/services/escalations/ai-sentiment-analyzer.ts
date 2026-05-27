/**
 * AI-Powered Sentiment Analysis Service
 * 
 * Uses OpenAI to perform deep contextual analysis of conversations for:
 * - Emotional state detection
 * - Sentiment analysis
 * - Behavioral risk assessment
 * - Pattern recognition over time
 * - Indirect emotional cue detection
 */

import OpenAI from 'openai';

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative' | 'critical'
  sentimentScore: number // -1 to 1 scale
  emotionalState: string
  confidence: number // 0 to 1
  detectedEmotions: string[]
  tone: string
  riskIndicators: RiskIndicator[]
  contextualFactors: ContextualFactor[]
}

export interface RiskIndicator {
  type: 'self_harm' | 'suicidal_intent' | 'depression' | 'hopelessness' | 'isolation' | 'fear' | 'abuse' | 'dangerous_intent' | 'panic' | 'extreme_stress'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  evidence: string[]
  isDirect: boolean // Direct mention vs indirect cue
}

export interface ContextualFactor {
  factor: string
  impact: 'positive' | 'negative' | 'neutral'
  description: string
}

export interface ConversationAnalysis {
  currentMessage: SentimentAnalysis
  conversationTrend: 'improving' | 'stable' | 'declining' | 'crisis'
  emotionalProgression: EmotionalProgression[]
  patternAnalysis: PatternAnalysis
  overallRiskLevel: 'safe' | 'mild_concern' | 'moderate_concern' | 'high_risk' | 'critical_emergency'
  riskScore: number // 0 to 100
  confidence: number
  requiresImmediateAction: boolean
  recommendedActions: string[]
}

export interface EmotionalProgression {
  messageIndex: number
  sentiment: string
  emotionalState: string
  riskScore: number
}

export interface PatternAnalysis {
  hasEscalatingPattern: boolean
  hasRecurringThemes: string[]
  suddenShiftsDetected: boolean
  isolationIndicators: number
  helpSeekingBehavior: boolean
  supportSystemMentioned: boolean
}

export class AISentimentAnalyzer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Analyzes a single message for sentiment and risk indicators
   */
  async analyzeMessage(message: string, conversationContext?: string[]): Promise<SentimentAnalysis> {
    const prompt = this.buildAnalysisPrompt(message, conversationContext);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      return this.parseAnalysisResult(result);
    } catch (error) {
      console.error('AI sentiment analysis failed:', error);
      return this.getFallbackAnalysis(message);
    }
  }

  /**
   * Analyzes full conversation for patterns and trends
   */
  async analyzeConversation(
    messages: string[],
    currentMessage: string
  ): Promise<ConversationAnalysis> {
    console.log(`[AISentiment] Analyzing conversation with ${messages.length} messages`);

    // Analyze current message
    const currentAnalysis = await this.analyzeMessage(currentMessage, messages);

    // Analyze conversation trend and patterns
    const trendAnalysis = await this.analyzeConversationTrend(messages, currentAnalysis);

    // Calculate overall risk score
    const riskAssessment = this.calculateOverallRisk(currentAnalysis, trendAnalysis);

    return {
      currentMessage: currentAnalysis,
      conversationTrend: trendAnalysis.trend,
      emotionalProgression: trendAnalysis.progression,
      patternAnalysis: trendAnalysis.patterns,
      overallRiskLevel: riskAssessment.level,
      riskScore: riskAssessment.score,
      confidence: riskAssessment.confidence,
      requiresImmediateAction: riskAssessment.requiresImmediateAction,
      recommendedActions: riskAssessment.actions
    };
  }

  /**
   * Analyzes conversation trends and patterns over time
   */
  private async analyzeConversationTrend(
    messages: string[],
    currentAnalysis: SentimentAnalysis
  ): Promise<{
    trend: 'improving' | 'stable' | 'declining' | 'crisis'
    progression: EmotionalProgression[]
    patterns: PatternAnalysis
  }> {
    if (messages.length < 2) {
      return {
        trend: 'stable',
        progression: [],
        patterns: this.getDefaultPatternAnalysis()
      };
    }

    // Sample messages for trend analysis (avoid too many API calls)
    const sampleSize = Math.min(messages.length, 10);
    const step = Math.ceil(messages.length / sampleSize);
    const sampledMessages: string[] = [];
    
    for (let i = 0; i < messages.length; i += step) {
      sampledMessages.push(messages[i]);
    }
    
    // Ensure current message is included
    if (!sampledMessages.includes(messages[messages.length - 1])) {
      sampledMessages.push(messages[messages.length - 1]);
    }

    // Analyze each sampled message
    const progression: EmotionalProgression[] = [];
    for (let i = 0; i < sampledMessages.length; i++) {
      const analysis = await this.analyzeMessage(sampledMessages[i]);
      progression.push({
        messageIndex: i,
        sentiment: analysis.overallSentiment,
        emotionalState: analysis.emotionalState,
        riskScore: this.calculateMessageRiskScore(analysis)
      });
    }

    // Determine trend
    const trend = this.determineTrend(progression);
    
    // Analyze patterns
    const patterns = this.analyzePatterns(sampledMessages, progression);

    return { trend, progression, patterns };
  }

  /**
   * Calculates overall risk based on current analysis and trends
   */
  private calculateOverallRisk(
    currentAnalysis: SentimentAnalysis,
    trendAnalysis: { trend: string; patterns: PatternAnalysis }
  ): {
    level: 'safe' | 'mild_concern' | 'moderate_concern' | 'high_risk' | 'critical_emergency'
    score: number
    confidence: number
    requiresImmediateAction: boolean
    actions: string[]
  } {
    let riskScore = 50; // Base score
    let confidence = currentAnalysis.confidence;

    // Factor in current message sentiment
    if (currentAnalysis.overallSentiment === 'critical') {
      riskScore += 40;
    } else if (currentAnalysis.overallSentiment === 'negative') {
      riskScore += 20;
    } else if (currentAnalysis.overallSentiment === 'positive') {
      riskScore -= 10;
    }

    // Factor in risk indicators
    for (const indicator of currentAnalysis.riskIndicators) {
      if (indicator.severity === 'critical') {
        riskScore += 30;
        if (indicator.isDirect) riskScore += 10;
      } else if (indicator.severity === 'high') {
        riskScore += 20;
        if (indicator.isDirect) riskScore += 5;
      } else if (indicator.severity === 'medium') {
        riskScore += 10;
      } else if (indicator.severity === 'low') {
        riskScore += 5;
      }
    }

    // Factor in conversation trend
    if (trendAnalysis.trend === 'crisis') {
      riskScore += 25;
    } else if (trendAnalysis.trend === 'declining') {
      riskScore += 15;
    } else if (trendAnalysis.trend === 'improving') {
      riskScore -= 10;
    }

    // Factor in patterns
    if (trendAnalysis.patterns.hasEscalatingPattern) {
      riskScore += 20;
    }
    if (trendAnalysis.patterns.suddenShiftsDetected) {
      riskScore += 15;
    }
    if (trendAnalysis.patterns.isolationIndicators > 2) {
      riskScore += 10;
    }
    if (!trendAnalysis.patterns.supportSystemMentioned) {
      riskScore += 5;
    }

    // Clamp score to 0-100
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine risk level
    let level: 'safe' | 'mild_concern' | 'moderate_concern' | 'high_risk' | 'critical_emergency';
    let requiresImmediateAction = false;
    const actions: string[] = [];

    if (riskScore >= 80) {
      level = 'critical_emergency';
      requiresImmediateAction = true;
      actions.push('IMMEDIATE INTERVENTION REQUIRED', 'Contact emergency services', 'Notify parents/guardians', 'Alert school administration');
    } else if (riskScore >= 60) {
      level = 'high_risk';
      requiresImmediateAction = true;
      actions.push('URGENT counselor intervention required', 'Notify parents/guardians', 'Schedule immediate session');
    } else if (riskScore >= 40) {
      level = 'moderate_concern';
      actions.push('Schedule counseling session', 'Monitor closely', 'Consider parent notification');
    } else if (riskScore >= 20) {
      level = 'mild_concern';
      actions.push('Monitor conversation', 'Check in with student', 'Document concerns');
    } else {
      level = 'safe';
      actions.push('Continue normal monitoring');
    }

    // Check for critical risk indicators regardless of score
    const hasCriticalIndicators = currentAnalysis.riskIndicators.some(
      ind => ind.severity === 'critical' && ind.isDirect
    );
    if (hasCriticalIndicators) {
      level = 'critical_emergency';
      requiresImmediateAction = true;
      riskScore = Math.max(riskScore, 85);
    }

    return { level, score: riskScore, confidence, requiresImmediateAction, actions };
  }

  /**
   * Determines conversation trend from emotional progression
   */
  private determineTrend(progression: EmotionalProgression[]): 'improving' | 'stable' | 'declining' | 'crisis' {
    if (progression.length < 2) return 'stable';

    const recentScores = progression.slice(-3).map(p => p.riskScore);
    const earlierScores = progression.slice(0, -3).map(p => p.riskScore);
    
    if (earlierScores.length === 0) return 'stable';

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const earlierAvg = earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length;

    const difference = recentAvg - earlierAvg;

    if (recentScores.some(s => s >= 80)) {
      return 'crisis';
    } else if (difference > 20) {
      return 'declining';
    } else if (difference < -10) {
      return 'improving';
    } else {
      return 'stable';
    }
  }

  /**
   * Analyzes patterns in conversation
   */
  private analyzePatterns(messages: string[], progression: EmotionalProgression[]): PatternAnalysis {
    const fullText = messages.join(' ').toLowerCase();
    
    // Check for escalating pattern
    const hasEscalatingPattern = progression.length >= 3 &&
      progression.slice(-3).every((p, i) => i === 0 || p.riskScore >= progression[i - 1].riskScore);

    // Check for recurring themes
    const recurringThemes: string[] = [];
    const themeKeywords = {
      'loneliness': ['lonely', 'alone', 'no one', 'isolated', 'by myself'],
      'anxiety': ['anxious', 'worried', 'panic', 'scared', 'nervous'],
      'sadness': ['sad', 'depressed', 'unhappy', 'miserable', 'hopeless'],
      'anger': ['angry', 'furious', 'rage', 'hate', 'frustrated'],
      'stress': ['stressed', 'overwhelmed', 'pressure', 'too much']
    };

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const count = keywords.filter(kw => fullText.includes(kw)).length;
      if (count >= 2) recurringThemes.push(theme);
    }

    // Check for sudden shifts
    const suddenShiftsDetected = progression.length >= 2 &&
      Math.abs(progression[progression.length - 1].riskScore - progression[progression.length - 2].riskScore) > 30;

    // Count isolation indicators
    const isolationKeywords = ['alone', 'lonely', 'isolated', 'no one', 'by myself', 'nobody'];
    const isolationIndicators = isolationKeywords.filter(kw => fullText.includes(kw)).length;

    // Check for help-seeking behavior
    const helpSeekingKeywords = ['help', 'need help', 'someone to talk', 'support', 'advice'];
    const helpSeekingBehavior = helpSeekingKeywords.some(kw => fullText.includes(kw));

    // Check for support system
    const supportKeywords = ['friend', 'family', 'parent', 'teacher', 'counselor', 'therapist'];
    const supportSystemMentioned = supportKeywords.some(kw => fullText.includes(kw));

    return {
      hasEscalatingPattern,
      hasRecurringThemes: recurringThemes,
      suddenShiftsDetected,
      isolationIndicators,
      helpSeekingBehavior,
      supportSystemMentioned
    };
  }

  /**
   * Calculates risk score for a single message
   */
  private calculateMessageRiskScore(analysis: SentimentAnalysis): number {
    let score = 50;

    if (analysis.overallSentiment === 'critical') score += 40;
    else if (analysis.overallSentiment === 'negative') score += 20;
    else if (analysis.overallSentiment === 'positive') score -= 10;

    for (const indicator of analysis.riskIndicators) {
      if (indicator.severity === 'critical') score += 30;
      else if (indicator.severity === 'high') score += 20;
      else if (indicator.severity === 'medium') score += 10;
      else if (indicator.severity === 'low') score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Builds analysis prompt for OpenAI
   */
  private buildAnalysisPrompt(message: string, conversationContext?: string[]): string {
    let prompt = `Analyze the following message for emotional state, sentiment, and risk indicators:\n\n"${message}"\n\n`;

    if (conversationContext && conversationContext.length > 0) {
      prompt += `Conversation context (${conversationContext.length} previous messages):\n`;
      conversationContext.slice(-5).forEach((msg, i) => {
        prompt += `${i + 1}. "${msg}"\n`;
      });
      prompt += '\n';
    }

    prompt += `Provide a detailed analysis including:
1. Overall sentiment (positive/neutral/negative/critical)
2. Sentiment score (-1 to 1)
3. Current emotional state
4. Confidence level (0 to 1)
5. Detected emotions
6. Tone of the message
7. Risk indicators (type, severity, confidence, evidence, whether direct or indirect)
8. Contextual factors affecting the analysis

Focus on detecting:
- Self-harm or suicidal intent (direct or indirect)
- Depression and hopelessness
- Isolation and loneliness
- Fear and anxiety
- Abuse or dangerous situations
- Panic or extreme stress
- Any indirect emotional cues or conversational intent

Distinguish between direct mentions (explicit statements) and indirect cues (subtle hints, metaphors, changes in tone).`;

    return prompt;
  }

  /**
   * Gets system prompt for AI analysis
   */
  private getSystemPrompt(): string {
    return `You are an expert mental health AI assistant specializing in sentiment analysis and risk assessment for student conversations. Your role is to:

1. Analyze emotional state with high accuracy
2. Detect subtle risk indicators and indirect emotional cues
3. Assess behavioral patterns over time
4. Distinguish between direct statements and indirect expressions
5. Provide confidence scores for all assessments
6. Consider full conversation context before making judgments
7. Avoid false positives by requiring multiple indicators
8. Understand conversational intent beyond literal meaning

Risk Categories:
- Self-harm: Direct or indirect mentions of hurting oneself
- Suicidal intent: Thoughts or plans of ending one's life
- Depression: Persistent sadness, hopelessness, loss of interest
- Hopelessness: Feeling that things will never improve
- Isolation: Feeling alone, disconnected, or unsupported
- Fear: Anxiety, panic, worry about safety
- Abuse: Physical, emotional, or sexual harm
- Dangerous intent: Plans to harm others or engage in risky behavior
- Panic: Acute anxiety or overwhelming distress
- Extreme stress: Overwhelming pressure beyond coping capacity

Severity Levels:
- Critical: Immediate danger, requires emergency intervention
- High: Serious concern, needs urgent attention
- Medium: Moderate concern, should be monitored
- Low: Mild concern, worth noting

Always provide evidence for your assessments and distinguish between direct mentions and indirect cues. Consider the full conversation context before escalating.`;
  }

  /**
   * Parses AI analysis result
   */
  private parseAnalysisResult(result: any): SentimentAnalysis {
    return {
      overallSentiment: result.overallSentiment || 'neutral',
      sentimentScore: result.sentimentScore || 0,
      emotionalState: result.emotionalState || 'neutral',
      confidence: result.confidence || 0.5,
      detectedEmotions: result.detectedEmotions || [],
      tone: result.tone || 'neutral',
      riskIndicators: result.riskIndicators || [],
      contextualFactors: result.contextualFactors || []
    };
  }

  /**
   * Provides fallback analysis when AI fails
   */
  private getFallbackAnalysis(message: string): SentimentAnalysis {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based fallback
    const riskIndicators: RiskIndicator[] = [];
    
    if (lowerMessage.includes('kill myself') || lowerMessage.includes('suicide')) {
      riskIndicators.push({
        type: 'suicidal_intent',
        severity: 'critical',
        confidence: 0.8,
        evidence: ['Direct mention of suicide or self-harm'],
        isDirect: true
      });
    }

    return {
      overallSentiment: riskIndicators.length > 0 ? 'negative' : 'neutral',
      sentimentScore: riskIndicators.length > 0 ? -0.5 : 0,
      emotionalState: 'unknown',
      confidence: 0.3,
      detectedEmotions: [],
      tone: 'neutral',
      riskIndicators,
      contextualFactors: []
    };
  }

  /**
   * Gets default pattern analysis
   */
  private getDefaultPatternAnalysis(): PatternAnalysis {
    return {
      hasEscalatingPattern: false,
      hasRecurringThemes: [],
      suddenShiftsDetected: false,
      isolationIndicators: 0,
      helpSeekingBehavior: false,
      supportSystemMentioned: false
    };
  }
}

