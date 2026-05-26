/**
 * AI Safety Guardrails for Chatbot Responses
 * 
 * Ensures chatbot responses are:
 * - Empathetic and supportive during distress
 * - Safe and appropriate for mental health contexts
 * - Not harmful or insensitive
 * - Properly directed to professional help when needed
 * - Compliant with ethical guidelines
 */

import OpenAI from 'openai';

export interface SafetyCheck {
  isSafe: boolean
  riskLevel: 'safe' | 'caution' | 'unsafe'
  issues: SafetyIssue[]
  suggestedResponse?: string
  requiresProfessionalReferral: boolean
}

export interface SafetyIssue {
  type: 'harmful_content' | 'insensitive' | 'medical_advice' | 'inappropriate' | 'missing_empathy'
  severity: 'low' | 'medium' | 'high'
  description: string
  location?: string
}

export interface GuardrailConfig {
  enableEmpathyCheck: boolean
  enableMedicalAdviceCheck: boolean
  enableHarmfulContentCheck: boolean
  enableToneCheck: boolean
  requireProfessionalReferralFor: string[]
}

export class AISafetyGuardrails {
  private openai: OpenAI;
  private config: GuardrailConfig;

  constructor(config?: Partial<GuardrailConfig>) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    this.config = {
      enableEmpathyCheck: true,
      enableMedicalAdviceCheck: true,
      enableHarmfulContentCheck: true,
      enableToneCheck: true,
      requireProfessionalReferralFor: ['suicidal_intent', 'self_harm', 'critical_emergency'],
      ...config
    };
  }

  /**
   * Checks if a response is safe and appropriate
   */
  async checkResponse(
    response: string,
    userMessage: string,
    conversationContext?: string[]
  ): Promise<SafetyCheck> {
    console.log('[SafetyGuardrails] Checking response safety');

    const issues: SafetyIssue[] = [];
    let isSafe = true;
    let riskLevel: 'safe' | 'caution' | 'unsafe' = 'safe';
    let requiresProfessionalReferral = false;

    try {
      // Use AI to perform comprehensive safety check
      const safetyAnalysis = await this.performAISafetyCheck(response, userMessage, conversationContext);

      issues.push(...safetyAnalysis.issues);
      isSafe = safetyAnalysis.isSafe;
      riskLevel = safetyAnalysis.riskLevel;
      requiresProfessionalReferral = safetyAnalysis.requiresProfessionalReferral;

      // If response is unsafe, generate a safer alternative
      if (!isSafe) {
        const suggestedResponse = await this.generateSafeResponse(userMessage, conversationContext, safetyAnalysis.issues);
        return {
          isSafe: false,
          riskLevel,
          issues,
          suggestedResponse,
          requiresProfessionalReferral
        };
      }

      return {
        isSafe: true,
        riskLevel,
        issues,
        requiresProfessionalReferral
      };

    } catch (error) {
      console.error('[SafetyGuardrails] AI safety check failed, using rule-based fallback:', error);
      return this.ruleBasedCheck(response, userMessage);
    }
  }

  /**
   * Performs AI-based safety check
   */
  private async performAISafetyCheck(
    response: string,
    userMessage: string,
    conversationContext?: string[]
  ): Promise<{
    isSafe: boolean
    riskLevel: 'safe' | 'caution' | 'unsafe'
    issues: SafetyIssue[]
    requiresProfessionalReferral: boolean
  }> {
    const prompt = this.buildSafetyCheckPrompt(response, userMessage, conversationContext);

    try {
      const aiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSafetySystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(aiResponse.choices[0]?.message?.content || '{}');

      return {
        isSafe: result.isSafe !== false,
        riskLevel: result.riskLevel || 'safe',
        issues: result.issues || [],
        requiresProfessionalReferral: result.requiresProfessionalReferral || false
      };

    } catch (error) {
      console.error('[SafetyGuardrails] AI safety check failed:', error);
      throw error;
    }
  }

  /**
   * Generates a safe, empathetic response
   */
  private async generateSafeResponse(
    userMessage: string,
    conversationContext?: string[],
    issues?: SafetyIssue[]
  ): Promise<string> {
    const prompt = this.buildSafeResponsePrompt(userMessage, conversationContext, issues);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSafeResponseSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0]?.message?.content || this.getDefaultSafeResponse();
    } catch (error) {
      console.error('[SafetyGuardrails] Failed to generate safe response:', error);
      return this.getDefaultSafeResponse();
    }
  }

  /**
   * Rule-based fallback safety check
   */
  private ruleBasedCheck(response: string, userMessage: string): SafetyCheck {
    const issues: SafetyIssue[] = [];
    const lowerResponse = response.toLowerCase();
    const lowerUserMessage = userMessage.toLowerCase();

    // Check for harmful content
    const harmfulPatterns = [
      'kill yourself', 'commit suicide', 'end your life',
      'hurt others', 'harm someone', 'violence'
    ];

    for (const pattern of harmfulPatterns) {
      if (lowerResponse.includes(pattern)) {
        issues.push({
          type: 'harmful_content',
          severity: 'high',
          description: `Response contains harmful content: ${pattern}`
        });
      }
    }

    // Check for medical advice
    const medicalPatterns = [
      'you should take', 'prescribe', 'medication', 'diagnosis',
      'medical treatment', 'therapy advice'
    ];

    for (const pattern of medicalPatterns) {
      if (lowerResponse.includes(pattern)) {
        issues.push({
          type: 'medical_advice',
          severity: 'medium',
          description: `Response may contain medical advice: ${pattern}`
        });
      }
    }

    // Check for insensitive responses to distress
    if (this.containsDistressIndicators(lowerUserMessage)) {
      if (!this.containsEmpathy(lowerResponse)) {
        issues.push({
          type: 'missing_empathy',
          severity: 'high',
          description: 'Response lacks empathy for distressed user'
        });
      }
    }

    const isSafe = issues.filter(i => i.severity === 'high').length === 0;
    const riskLevel = isSafe ? 'safe' : (issues.length > 2 ? 'unsafe' : 'caution');

    return {
      isSafe,
      riskLevel,
      issues,
      requiresProfessionalReferral: this.containsCriticalIndicators(lowerUserMessage)
    };
  }

  /**
   * Checks if message contains distress indicators
   */
  private containsDistressIndicators(message: string): boolean {
    const distressPatterns = [
      'sad', 'depressed', 'anxious', 'worried', 'scared',
      'hurting', 'pain', 'struggling', 'overwhelmed',
      'hopeless', 'helpless', 'alone', 'lonely'
    ];

    return distressPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Checks if response contains empathy
   */
  private containsEmpathy(response: string): boolean {
    const empathyPatterns = [
      'sorry', 'understand', 'here for you', 'support',
      'listen', 'care', 'concerned', 'feel'
    ];

    return empathyPatterns.some(pattern => response.includes(pattern));
  }

  /**
   * Checks if message contains critical indicators
   */
  private containsCriticalIndicators(message: string): boolean {
    const criticalPatterns = [
      'kill myself', 'suicide', 'end my life', 'want to die',
      'hurt myself', 'self harm'
    ];

    return criticalPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Builds safety check prompt
   */
  private buildSafetyCheckPrompt(
    response: string,
    userMessage: string,
    conversationContext?: string[]
  ): string {
    let prompt = `Analyze the following chatbot response for safety and appropriateness:\n\n`;
    prompt += `User's message: "${userMessage}"\n\n`;
    prompt += `Chatbot's response: "${response}"\n\n`;

    if (conversationContext && conversationContext.length > 0) {
      prompt += `Conversation context:\n`;
      conversationContext.slice(-3).forEach((msg, i) => {
        prompt += `${i + 1}. "${msg}"\n`;
      });
      prompt += '\n';
    }

    prompt += `Evaluate the response for:
1. Harmful content (encouraging self-harm, violence, etc.)
2. Insensitive or dismissive language
3. Medical or clinical advice (should only come from professionals)
4. Inappropriate content for mental health context
5. Missing empathy when user is distressed
6. Whether professional referral is needed

Provide a JSON response with:
{
  "isSafe": boolean,
  "riskLevel": "safe" | "caution" | "unsafe",
  "issues": [
    {
      "type": "harmful_content" | "insensitive" | "medical_advice" | "inappropriate" | "missing_empathy",
      "severity": "low" | "medium" | "high",
      "description": string
    }
  ],
  "requiresProfessionalReferral": boolean
}`;

    return prompt;
  }

  /**
   * Builds safe response generation prompt
   */
  private buildSafeResponsePrompt(
    userMessage: string,
    conversationContext?: string[],
    issues?: SafetyIssue[]
  ): string {
    let prompt = `Generate a safe, empathetic response to the following user message:\n\n`;
    prompt += `User's message: "${userMessage}"\n\n`;

    if (issues && issues.length > 0) {
      prompt += `Safety concerns to address:\n`;
      issues.forEach(issue => {
        prompt += `- ${issue.type}: ${issue.description}\n`;
      });
      prompt += '\n';
    }

    if (conversationContext && conversationContext.length > 0) {
      prompt += `Conversation context:\n`;
      conversationContext.slice(-2).forEach((msg, i) => {
        prompt += `${i + 1}. "${msg}"\n`;
      });
      prompt += '\n';
    }

    prompt += `Guidelines for the response:
1. Be empathetic and supportive
2. Do not provide medical or clinical advice
3. Do not encourage harmful behavior
4. If user mentions self-harm or suicide, direct them to professional help
5. Keep response warm and conversational (like a friend)
6. Use 1-2 soft emojis (🌊, 🌿, 🤍)
7. Maximum 3 sentences
8. End with a supportive question`;

    return prompt;
  }

  /**
   * Gets safety system prompt
   */
  private getSafetySystemPrompt(): string {
    return `You are a safety evaluator for mental health chatbot responses. Your role is to ensure responses are:

1. Safe and appropriate for mental health contexts
2. Empathetic and supportive, especially when users are distressed
3. Free from harmful content or encouragement of dangerous behavior
4. Not providing medical or clinical advice (that's for professionals)
5. Culturally sensitive and inclusive
6. Properly directing to professional help when needed

Safety Categories:
- Harmful content: Encouraging self-harm, violence, or dangerous behavior
- Insensitive: Dismissive, judgmental, or lacking empathy
- Medical advice: Prescribing treatments, medications, or diagnoses
- Inappropriate: Content not suitable for mental health support
- Missing empathy: Failing to show understanding or care when user is distressed

Risk Levels:
- Safe: No issues or only minor issues
- Caution: Some concerns but response is acceptable
- Unsafe: Serious issues that require correction

Professional Referral:
Required when user mentions self-harm, suicide, or critical mental health crisis. Response should direct them to professional help.`;
  }

  /**
   * Gets safe response system prompt
   */
  private getSafeResponseSystemPrompt(): string {
    return `You are Buddy, a supportive AI friend for students. Your responses must be:

1. Warm, empathetic, and supportive
2. Conversational (like a friend, not a therapist)
3. Safe and appropriate for mental health contexts
4. Never provide medical or clinical advice
5. Never encourage harmful behavior
6. Direct to professional help when user mentions self-harm or suicide
7. Use soft emojis (🌊, 🌿, 🤍) sparingly
8. Keep responses brief (2-3 sentences max)
9. End with a supportive question

Remember: You are a friend who listens and supports, not a professional who treats. Always prioritize safety and empathy.`;
  }

  /**
   * Gets default safe response
   */
  private getDefaultSafeResponse(): string {
    return "I'm really glad you shared that with me. I'm here to listen and support you. How can I help you right now? 🤍";
  }

  /**
   * Applies safety guardrails to a response before sending
   */
  async applyGuardrails(
    response: string,
    userMessage: string,
    conversationContext?: string[]
  ): Promise<string> {
    const safetyCheck = await this.checkResponse(response, userMessage, conversationContext);

    if (!safetyCheck.isSafe && safetyCheck.suggestedResponse) {
      console.log('[SafetyGuardrails] Replacing unsafe response with safe alternative');
      return safetyCheck.suggestedResponse;
    }

    return response;
  }

  /**
   * Checks if professional referral is needed based on user message
   */
  requiresProfessionalReferral(userMessage: string): boolean {
    const lowerMessage = userMessage.toLowerCase();
    const criticalIndicators = [
      'kill myself', 'suicide', 'end my life', 'want to die',
      'hurt myself', 'self harm', 'plan to kill', 'going to hurt'
    ];

    return criticalIndicators.some(indicator => lowerMessage.includes(indicator));
  }

  /**
   * Generates professional referral message
   */
  generateProfessionalReferralMessage(): string {
    return "I care about you a lot, and because I'm just an AI, I can't provide the help you need right now. Please reach out to a trusted adult, counselor, or call emergency services. Your safety matters too much to handle alone. 🛡️ Would you like me to help you find someone to talk to? 🌊";
  }
}
