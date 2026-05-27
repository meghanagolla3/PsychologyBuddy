/**
 * Risk Scoring Engine
 * 
 * Calculates comprehensive risk scores based on:
 * - Sentiment analysis results
 * - Conversation patterns
 * - Behavioral indicators
 * - Temporal trends
 * - Contextual factors
 * 
 * Provides confidence percentages and threshold-based escalation triggers
 */

import { ConversationAnalysis, SentimentAnalysis } from './ai-sentiment-analyzer';

export interface RiskAssessment {
  overallRiskLevel: 'safe' | 'mild_concern' | 'moderate_concern' | 'high_risk' | 'critical_emergency'
  riskScore: number // 0-100
  confidence: number // 0-1
  componentScores: ComponentScores
  thresholdCrossed: boolean
  requiresEscalation: boolean
  requiresImmediateAction: boolean
  escalationReason: string[]
  recommendedActions: string[]
  timestamp: string
}

export interface ComponentScores {
  sentimentScore: number // 0-100
  patternScore: number // 0-100
  behavioralScore: number // 0-100
  contextualScore: number // 0-100
  temporalScore: number // 0-100
}

export interface RiskThreshold {
  level: 'safe' | 'mild_concern' | 'moderate_concern' | 'high_risk' | 'critical_emergency'
  minScore: number
  maxScore: number
  requiresEscalation: boolean
  requiresImmediateAction: boolean
  notificationChannels: ('email' | 'sms' | 'push' | 'dashboard')[]
}

export class RiskScoringEngine {
  private static readonly THRESHOLDS: RiskThreshold[] = [
    {
      level: 'safe',
      minScore: 0,
      maxScore: 19,
      requiresEscalation: false,
      requiresImmediateAction: false,
      notificationChannels: []
    },
    {
      level: 'mild_concern',
      minScore: 20,
      maxScore: 39,
      requiresEscalation: false,
      requiresImmediateAction: false,
      notificationChannels: ['dashboard']
    },
    {
      level: 'moderate_concern',
      minScore: 40,
      maxScore: 59,
      requiresEscalation: true,
      requiresImmediateAction: false,
      notificationChannels: ['dashboard', 'email']
    },
    {
      level: 'high_risk',
      minScore: 60,
      maxScore: 79,
      requiresEscalation: true,
      requiresImmediateAction: true,
      notificationChannels: ['dashboard', 'email', 'sms']
    },
    {
      level: 'critical_emergency',
      minScore: 80,
      maxScore: 100,
      requiresEscalation: true,
      requiresImmediateAction: true,
      notificationChannels: ['dashboard', 'email', 'sms', 'push']
    }
  ];

  /**
   * Calculates comprehensive risk assessment from conversation analysis
   */
  static calculateRisk(analysis: ConversationAnalysis): RiskAssessment {
    console.log(`[RiskScoring] Calculating risk for conversation with ${analysis.emotionalProgression.length} messages`);

    // Calculate component scores
    const componentScores = this.calculateComponentScores(analysis);

    // Calculate weighted overall score
    const overallScore = this.calculateOverallScore(componentScores);

    // Determine confidence
    const confidence = this.calculateConfidence(analysis, componentScores);

    // Determine risk level based on score
    const riskLevel = this.determineRiskLevel(overallScore);

    // Check if threshold is crossed
    const threshold = this.getThreshold(riskLevel);
    const thresholdCrossed = threshold.requiresEscalation;

    // Generate escalation reasons
    const escalationReasons = this.generateEscalationReasons(analysis, componentScores);

    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(riskLevel, analysis);

    return {
      overallRiskLevel: riskLevel,
      riskScore: overallScore,
      confidence,
      componentScores,
      thresholdCrossed,
      requiresEscalation: threshold.requiresEscalation,
      requiresImmediateAction: threshold.requiresImmediateAction,
      escalationReason: escalationReasons,
      recommendedActions,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculates individual component scores
   */
  private static calculateComponentScores(analysis: ConversationAnalysis): ComponentScores {
    // Sentiment score based on current message sentiment
    const sentimentScore = this.calculateSentimentScore(analysis.currentMessage);

    // Pattern score based on conversation patterns
    const patternScore = this.calculatePatternScore(analysis.patternAnalysis);

    // Behavioral score based on risk indicators
    const behavioralScore = this.calculateBehavioralScore(analysis.currentMessage);

    // Contextual score based on contextual factors
    const contextualScore = this.calculateContextualScore(analysis.currentMessage);

    // Temporal score based on conversation trend
    const temporalScore = this.calculateTemporalScore(analysis.conversationTrend, analysis.emotionalProgression);

    return {
      sentimentScore,
      patternScore,
      behavioralScore,
      contextualScore,
      temporalScore
    };
  }

  /**
   * Calculates sentiment component score
   */
  private static calculateSentimentScore(analysis: SentimentAnalysis): number {
    let score = 50; // Base score

    // Factor in overall sentiment
    switch (analysis.overallSentiment) {
      case 'critical':
        score += 40;
        break;
      case 'negative':
        score += 20;
        break;
      case 'neutral':
        score += 0;
        break;
      case 'positive':
        score -= 10;
        break;
    }

    // Factor in sentiment score (-1 to 1 scale)
    score += analysis.sentimentScore * 20;

    // Factor in confidence
    score *= (0.5 + analysis.confidence * 0.5);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculates pattern component score
   */
  private static calculatePatternScore(patterns: any): number {
    let score = 50; // Base score

    if (patterns.hasEscalatingPattern) {
      score += 25;
    }

    if (patterns.suddenShiftsDetected) {
      score += 20;
    }

    // Factor in recurring themes
    const themeCount = patterns.hasRecurringThemes?.length || 0;
    score += themeCount * 5;

    // Factor in isolation indicators
    score += patterns.isolationIndicators * 3;

    // Reduce score if help-seeking behavior is present
    if (patterns.helpSeekingBehavior) {
      score -= 10;
    }

    // Reduce score if support system is mentioned
    if (patterns.supportSystemMentioned) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculates behavioral component score
   */
  private static calculateBehavioralScore(analysis: SentimentAnalysis): number {
    let score = 50; // Base score

    for (const indicator of analysis.riskIndicators) {
      let indicatorScore = 0;

      switch (indicator.severity) {
        case 'critical':
          indicatorScore = 30;
          break;
        case 'high':
          indicatorScore = 20;
          break;
        case 'medium':
          indicatorScore = 10;
          break;
        case 'low':
          indicatorScore = 5;
          break;
      }

      // Boost for direct mentions
      if (indicator.isDirect) {
        indicatorScore *= 1.5;
      }

      // Factor in confidence
      indicatorScore *= indicator.confidence;

      score += indicatorScore;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculates contextual component score
   */
  private static calculateContextualScore(analysis: SentimentAnalysis): number {
    let score = 50; // Base score

    // Factor in contextual factors
    for (const factor of analysis.contextualFactors) {
      if (factor.impact === 'negative') {
        score += 10;
      } else if (factor.impact === 'positive') {
        score -= 5;
      }
    }

    // Factor in tone
    if (analysis.tone === 'desperate' || analysis.tone === 'hopeless') {
      score += 15;
    } else if (analysis.tone === 'anxious' || analysis.tone === 'fearful') {
      score += 10;
    } else if (analysis.tone === 'calm' || analysis.tone === 'hopeful') {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculates temporal component score
   */
  private static calculateTemporalScore(trend: string, progression: any[]): number {
    let score = 50; // Base score

    switch (trend) {
      case 'crisis':
        score += 30;
        break;
      case 'declining':
        score += 20;
        break;
      case 'stable':
        score += 0;
        break;
      case 'improving':
        score -= 10;
        break;
    }

    // Factor in progression if available
    if (progression.length >= 2) {
      const recent = progression.slice(-3);
      const avgRecentRisk = recent.reduce((sum: number, p: any) => sum + p.riskScore, 0) / recent.length;
      
      if (avgRecentRisk > 70) {
        score += 15;
      } else if (avgRecentRisk > 50) {
        score += 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculates weighted overall score
   */
  private static calculateOverallScore(components: ComponentScores): number {
    // Weight each component
    const weights = {
      sentimentScore: 0.25,
      patternScore: 0.20,
      behavioralScore: 0.30,
      contextualScore: 0.15,
      temporalScore: 0.10
    };

    const weightedScore =
      components.sentimentScore * weights.sentimentScore +
      components.patternScore * weights.patternScore +
      components.behavioralScore * weights.behavioralScore +
      components.contextualScore * weights.contextualScore +
      components.temporalScore * weights.temporalScore;

    return Math.round(weightedScore);
  }

  /**
   * Calculates confidence in the assessment
   */
  private static calculateConfidence(analysis: ConversationAnalysis, components: ComponentScores): number {
    let confidence = analysis.confidence;

    // Boost confidence if multiple components agree
    const highRiskComponents = Object.values(components).filter(score => score > 60).length;
    if (highRiskComponents >= 3) {
      confidence = Math.min(confidence + 0.1, 1.0);
    }

    // Reduce confidence if components disagree significantly
    const scores = Object.values(components);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const range = maxScore - minScore;

    if (range > 40) {
      confidence -= 0.15;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Determines risk level based on score
   */
  private static determineRiskLevel(score: number): 'safe' | 'mild_concern' | 'moderate_concern' | 'high_risk' | 'critical_emergency' {
    for (const threshold of this.THRESHOLDS) {
      if (score >= threshold.minScore && score <= threshold.maxScore) {
        return threshold.level;
      }
    }
    return 'safe';
  }

  /**
   * Gets threshold configuration for risk level
   */
  private static getThreshold(level: string): RiskThreshold {
    return this.THRESHOLDS.find(t => t.level === level) || this.THRESHOLDS[0];
  }

  /**
   * Generates escalation reasons
   */
  private static generateEscalationReasons(analysis: ConversationAnalysis, components: ComponentScores): string[] {
    const reasons: string[] = [];

    if (components.behavioralScore > 60) {
      reasons.push('High-risk behavioral indicators detected');
      const criticalIndicators = analysis.currentMessage.riskIndicators.filter(ind => ind.severity === 'critical');
      if (criticalIndicators.length > 0) {
        reasons.push(`Critical risk indicators: ${criticalIndicators.map(ind => ind.type).join(', ')}`);
      }
    }

    if (components.patternScore > 60) {
      reasons.push('Concerning conversation patterns detected');
      if (analysis.patternAnalysis.hasEscalatingPattern) {
        reasons.push('Escalating pattern of distress');
      }
      if (analysis.patternAnalysis.suddenShiftsDetected) {
        reasons.push('Sudden emotional shift detected');
      }
    }

    if (components.temporalScore > 60) {
      reasons.push(`Conversation trend: ${analysis.conversationTrend}`);
    }

    if (analysis.currentMessage.overallSentiment === 'critical') {
      reasons.push('Critical sentiment detected in current message');
    }

    if (analysis.patternAnalysis.isolationIndicators > 2) {
      reasons.push('Multiple isolation indicators detected');
    }

    return reasons;
  }

  /**
   * Generates recommended actions based on risk level
   */
  private static generateRecommendedActions(riskLevel: string, analysis: ConversationAnalysis): string[] {
    const actions: string[] = [];

    switch (riskLevel) {
      case 'critical_emergency':
        actions.push('IMMEDIATE INTERVENTION REQUIRED');
        actions.push('Contact emergency services (911 or local emergency number)');
        actions.push('Notify parents/guardians immediately');
        actions.push('Alert school administration and security');
        actions.push('Document all details for mandatory reporting');
        actions.push('Maintain supportive conversation while help arrives');
        break;

      case 'high_risk':
        actions.push('URGENT counselor intervention required');
        actions.push('Notify parents/guardians immediately');
        actions.push('Schedule emergency counseling session');
        actions.push('Alert school administration');
        actions.push('Monitor student continuously');
        actions.push('Consider emergency services if situation worsens');
        break;

      case 'moderate_concern':
        actions.push('Schedule counseling session within 24 hours');
        actions.push('Notify parents/guardians');
        actions.push('Document concerns and conversation details');
        actions.push('Monitor student closely');
        actions.push('Check in with student regularly');
        break;

      case 'mild_concern':
        actions.push('Monitor conversation for escalation');
        actions.push('Document concerns');
        actions.push('Consider wellness check-in');
        actions.push('Inform counselor for awareness');
        break;

      case 'safe':
        actions.push('Continue normal monitoring');
        actions.push('Maintain supportive conversation');
        break;
    }

    // Add contextual actions
    if (analysis.patternAnalysis.helpSeekingBehavior) {
      actions.push('Acknowledge and validate help-seeking behavior');
    }

    if (!analysis.patternAnalysis.supportSystemMentioned && riskLevel !== 'safe') {
      actions.push('Inquire about support system');
    }

    return actions;
  }

  /**
   * Gets all threshold configurations
   */
  static getThresholds(): RiskThreshold[] {
    return this.THRESHOLDS;
  }

  /**
   * Checks if score crosses escalation threshold
   */
  static crossesEscalationThreshold(score: number): boolean {
    const level = this.determineRiskLevel(score);
    const threshold = this.getThreshold(level);
    return threshold.requiresEscalation;
  }

  /**
   * Checks if score requires immediate action
   */
  static requiresImmediateAction(score: number): boolean {
    const level = this.determineRiskLevel(score);
    const threshold = this.getThreshold(level);
    return threshold.requiresImmediateAction;
  }
}

