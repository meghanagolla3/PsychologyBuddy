/**
 * AI-Powered Escalation Detector
 * 
 * Replaces keyword-based detection with AI/NLP-based contextual analysis.
 * Uses the AI sentiment analyzer and risk scoring engine for comprehensive assessment.
 */

import { AISentimentAnalyzer, ConversationAnalysis } from './ai-sentiment-analyzer';
import { RiskScoringEngine, RiskAssessment } from './risk-scoring-engine';

export interface AIEscalationDetection {
  isEscalation: boolean
  riskAssessment: RiskAssessment
  conversationAnalysis: ConversationAnalysis
  timestamp: string
  analysisId: string
}

export interface EscalationTrigger {
  triggered: boolean
  reason: string
  confidence: number
  recommendedActions: string[]
}

export class AIEscalationDetector {
  private sentimentAnalyzer: AISentimentAnalyzer;
  private riskEngine: typeof RiskScoringEngine;

  constructor() {
    this.sentimentAnalyzer = new AISentimentAnalyzer();
    this.riskEngine = RiskScoringEngine;
  }

  /**
   * Analyzes conversation for escalation using AI/NLP analysis
   */
  async detectEscalation(
    currentMessage: string,
    conversationHistory: string[]
  ): Promise<AIEscalationDetection> {
    console.log(`[AIEscalationDetector] Analyzing conversation with ${conversationHistory.length} messages`);

    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Perform AI-based conversation analysis
      const conversationAnalysis = await this.sentimentAnalyzer.analyzeConversation(
        conversationHistory,
        currentMessage
      );

      console.log(`[AIEscalationDetector] Conversation analysis complete:`, {
        riskLevel: conversationAnalysis.overallRiskLevel,
        riskScore: conversationAnalysis.riskScore,
        trend: conversationAnalysis.conversationTrend
      });

      // Calculate comprehensive risk assessment
      const riskAssessment = this.riskEngine.calculateRisk(conversationAnalysis);

      console.log(`[AIEscalationDetector] Risk assessment complete:`, {
        overallRiskLevel: riskAssessment.overallRiskLevel,
        riskScore: riskAssessment.riskScore,
        requiresEscalation: riskAssessment.requiresEscalation,
        requiresImmediateAction: riskAssessment.requiresImmediateAction
      });

      // Determine if escalation is triggered
      const isEscalation = this.determineEscalationTrigger(riskAssessment, conversationAnalysis);

      return {
        isEscalation,
        riskAssessment,
        conversationAnalysis,
        timestamp: new Date().toISOString(),
        analysisId
      };
    } catch (error) {
      console.error('[AIEscalationDetector] AI analysis failed, falling back to keyword detection:', error);
      
      // Fallback to keyword-based detection if AI fails
      return this.fallbackDetection(currentMessage, conversationHistory, analysisId);
    }
  }

  /**
   * Determines if escalation should be triggered based on assessment
   */
  private determineEscalationTrigger(
    riskAssessment: RiskAssessment,
    conversationAnalysis: ConversationAnalysis
  ): boolean {
    // Escalate if risk assessment requires it
    if (riskAssessment.requiresEscalation) {
      return true;
    }

    // Escalate if conversation analysis shows critical risk
    if (conversationAnalysis.overallRiskLevel === 'critical_emergency') {
      return true;
    }

    // Escalate if high risk with critical indicators
    if (conversationAnalysis.overallRiskLevel === 'high_risk') {
      const hasCriticalIndicators = conversationAnalysis.currentMessage.riskIndicators.some(
        ind => ind.severity === 'critical' && ind.isDirect
      );
      if (hasCriticalIndicators) {
        return true;
      }
    }

    // Escalate if conversation trend is crisis
    if (conversationAnalysis.conversationTrend === 'crisis') {
      return true;
    }

    return false;
  }

  /**
   * Fallback detection using keyword matching when AI fails
   */
  private async fallbackDetection(
    currentMessage: string,
    conversationHistory: string[],
    analysisId: string
  ): Promise<AIEscalationDetection> {
    console.log('[AIEscalationDetector] Using fallback keyword detection');

    // Import the original keyword-based detector
    const { ContentEscalationDetector } = await import('./content-escalation-detector');
    
    const keywordDetection = await ContentEscalationDetector.analyzeMessage(
      currentMessage,
      'unknown',
      'unknown',
      conversationHistory
    );

    // Convert keyword detection to AI format
    const riskLevel = this.mapKeywordLevelToRiskLevel(keywordDetection.level.level);
    const riskScore = keywordDetection.level.severity * 10;

    const riskAssessment: RiskAssessment = {
      overallRiskLevel: riskLevel,
      riskScore,
      confidence: keywordDetection.category.confidence,
      componentScores: {
        sentimentScore: riskScore,
        patternScore: 50,
        behavioralScore: riskScore,
        contextualScore: 50,
        temporalScore: 50
      },
      thresholdCrossed: keywordDetection.isEscalation,
      requiresEscalation: keywordDetection.isEscalation,
      requiresImmediateAction: keywordDetection.level.requiresImmediateAction,
      escalationReason: keywordDetection.detectedPhrases.length > 0 
        ? [`Keywords detected: ${keywordDetection.detectedPhrases.join(', ')}`]
        : [],
      recommendedActions: [keywordDetection.recommendation],
      timestamp: new Date().toISOString()
    };

    const conversationAnalysis: ConversationAnalysis = {
      currentMessage: {
        overallSentiment: riskLevel === 'safe' ? 'neutral' : 'negative',
        sentimentScore: riskScore > 50 ? -0.5 : 0,
        emotionalState: 'unknown',
        confidence: keywordDetection.category.confidence,
        detectedEmotions: [],
        tone: 'neutral',
        riskIndicators: [],
        contextualFactors: []
      },
      conversationTrend: 'stable',
      emotionalProgression: [],
      patternAnalysis: {
        hasEscalatingPattern: false,
        hasRecurringThemes: [],
        suddenShiftsDetected: false,
        isolationIndicators: 0,
        helpSeekingBehavior: false,
        supportSystemMentioned: false
      },
      overallRiskLevel: riskLevel,
      riskScore,
      confidence: keywordDetection.category.confidence,
      requiresImmediateAction: keywordDetection.level.requiresImmediateAction,
      recommendedActions: [keywordDetection.recommendation]
    };

    return {
      isEscalation: keywordDetection.isEscalation,
      riskAssessment,
      conversationAnalysis,
      timestamp: new Date().toISOString(),
      analysisId
    };
  }

  /**
   * Maps keyword-based level to risk level
   */
  private mapKeywordLevelToRiskLevel(level: string): 'safe' | 'mild_concern' | 'moderate_concern' | 'high_risk' | 'critical_emergency' {
    switch (level) {
      case 'critical':
        return 'critical_emergency';
      case 'high':
        return 'high_risk';
      case 'medium':
        return 'moderate_concern';
      case 'low':
        return 'mild_concern';
      default:
        return 'safe';
    }
  }

  /**
   * Validates if escalation should proceed (prevents false positives)
   */
  static isValidEscalation(detection: AIEscalationDetection): boolean {
    // If not detected as escalation, don't proceed
    if (!detection.isEscalation) {
      return false;
    }

    // Check confidence threshold
    if (detection.riskAssessment.confidence < 0.3) {
      console.log('[AIEscalationDetector] Escalation rejected due to low confidence');
      return false;
    }

    // For critical emergencies, lower confidence threshold
    if (detection.riskAssessment.overallRiskLevel === 'critical_emergency') {
      return detection.riskAssessment.confidence >= 0.2;
    }

    // For high risk, require moderate confidence
    if (detection.riskAssessment.overallRiskLevel === 'high_risk') {
      return detection.riskAssessment.confidence >= 0.4;
    }

    // For moderate concern, require reasonable confidence
    if (detection.riskAssessment.overallRiskLevel === 'moderate_concern') {
      return detection.riskAssessment.confidence >= 0.5;
    }

    // For mild concern, require higher confidence to avoid false positives
    if (detection.riskAssessment.overallRiskLevel === 'mild_concern') {
      return detection.riskAssessment.confidence >= 0.6;
    }

    return false;
  }

  /**
   * Gets escalation trigger details
   */
  static getEscalationTrigger(detection: AIEscalationDetection): EscalationTrigger {
    if (!detection.isEscalation) {
      return {
        triggered: false,
        reason: '',
        confidence: 0,
        recommendedActions: []
      };
    }

    return {
      triggered: true,
      reason: detection.riskAssessment.escalationReason.join('; '),
      confidence: detection.riskAssessment.confidence,
      recommendedActions: detection.riskAssessment.recommendedActions
    };
  }
}
