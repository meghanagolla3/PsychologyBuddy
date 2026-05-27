/**
 * Emergency Handling Service
 * 
 * Handles critical-risk situations with:
 * - Immediate protective responses
 * - Resource provision
 * - Emergency contact information
 * - Crisis intervention protocols
 */

import OpenAI from 'openai';

export interface EmergencyResponse {
  response: string
  resources: EmergencyResource[]
  requiresImmediateInterruption: boolean
  recommendedActions: string[]
}

export interface EmergencyResource {
  type: 'hotline' | 'emergency' | 'counselor' | 'parent' | 'professional'
  name: string
  contact: string
  description: string
  priority: 'immediate' | 'urgent' | 'recommended'
}

export class EmergencyHandler {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Generates an emergency response for critical-risk situations
   */
  async generateEmergencyResponse(
    userMessage: string,
    riskLevel: string,
    conversationContext?: string[]
  ): Promise<EmergencyResponse> {
    console.log(`[EmergencyHandler] Generating emergency response for risk level: ${riskLevel}`);

    try {
      // Generate protective response using AI
      const response = await this.generateProtectiveResponse(userMessage, riskLevel, conversationContext);
      
      // Get appropriate emergency resources
      const resources = this.getEmergencyResources(riskLevel);
      
      // Determine if immediate interruption is needed
      const requiresImmediateInterruption = riskLevel === 'critical_emergency';
      
      // Generate recommended actions
      const recommendedActions = this.generateRecommendedActions(riskLevel);

      return {
        response,
        resources,
        requiresImmediateInterruption,
        recommendedActions
      };
    } catch (error) {
      console.error('[EmergencyHandler] Failed to generate emergency response:', error);
      return this.getFallbackEmergencyResponse(riskLevel);
    }
  }

  /**
   * Generates a protective AI response for crisis situations
   */
  private async generateProtectiveResponse(
    userMessage: string,
    riskLevel: string,
    conversationContext?: string[]
  ): Promise<string> {
    const prompt = this.buildEmergencyResponsePrompt(userMessage, riskLevel, conversationContext);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getEmergencyResponseSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 250
      });

      return response.choices[0]?.message?.content || this.getDefaultEmergencyResponse(riskLevel);
    } catch (error) {
      console.error('[EmergencyHandler] AI response generation failed:', error);
      return this.getDefaultEmergencyResponse(riskLevel);
    }
  }

  /**
   * Gets emergency resources based on risk level
   */
  private getEmergencyResources(riskLevel: string): EmergencyResource[] {
    const resources: EmergencyResource[] = [];

    // Emergency resources (always included for critical/high risk)
    if (riskLevel === 'critical_emergency' || riskLevel === 'high_risk') {
      resources.push({
        type: 'emergency',
        name: 'Emergency Services',
        contact: '911',
        description: 'Call immediately if you or someone else is in immediate danger',
        priority: 'immediate'
      });
    }

    // Crisis hotlines
    if (riskLevel === 'critical_emergency') {
      resources.push({
        type: 'hotline',
        name: 'National Suicide Prevention Lifeline',
        contact: '988',
        description: '24/7 crisis support for suicide prevention and mental health crises',
        priority: 'immediate'
      });
    }

    if (riskLevel === 'critical_emergency' || riskLevel === 'high_risk') {
      resources.push({
        type: 'hotline',
        name: 'Crisis Text Line',
        contact: 'Text HOME to 741741',
        description: '24/7 crisis support via text message',
        priority: 'urgent'
      });
    }

    // School counselor
    resources.push({
      type: 'counselor',
      name: 'School Counselor',
      contact: 'Contact through school administration',
      description: 'Your school counselor is available to support you',
      priority: riskLevel === 'critical_emergency' ? 'immediate' : 'urgent'
    });

    // Parent/guardian
    resources.push({
      type: 'parent',
      name: 'Parent or Guardian',
      contact: 'Contact your parent or guardian',
      description: 'Reach out to a trusted adult at home',
      priority: riskLevel === 'critical_emergency' ? 'immediate' : 'recommended'
    });

    // Professional help
    resources.push({
      type: 'professional',
      name: 'Mental Health Professional',
      contact: 'Contact through doctor or insurance',
      description: 'Speak with a therapist or mental health professional',
      priority: 'recommended'
    });

    return resources;
  }

  /**
   * Generates recommended actions based on risk level
   */
  private generateRecommendedActions(riskLevel: string): string[] {
    const actions: string[] = [];

    if (riskLevel === 'critical_emergency') {
      actions.push('Call emergency services (911) immediately');
      actions.push('Contact a trusted adult right now');
      actions.push('Go to a safe location');
      actions.push('Stay on the phone with someone until help arrives');
      actions.push('Do not be alone - stay with someone you trust');
    } else if (riskLevel === 'high_risk') {
      actions.push('Contact a counselor immediately');
      actions.push('Tell a parent or trusted adult');
      actions.push('Call a crisis hotline (988)');
      actions.push('Stay in a safe environment');
      actions.push('Do not isolate yourself');
    } else if (riskLevel === 'moderate_concern') {
      actions.push('Schedule a counseling session');
      actions.push('Talk to a trusted adult');
      actions.push('Reach out to a friend for support');
      actions.push('Practice self-care activities');
    } else {
      actions.push('Consider talking to someone you trust');
      actions.push('Take breaks when feeling overwhelmed');
      actions.push('Reach out to counselor if needed');
    }

    return actions;
  }

  /**
   * Builds emergency response prompt
   */
  private buildEmergencyResponsePrompt(
    userMessage: string,
    riskLevel: string,
    conversationContext?: string[]
  ): string {
    let prompt = `Generate a protective, empathetic response for a student in distress.\n\n`;
    prompt += `Risk level: ${riskLevel}\n`;
    prompt += `Student's message: "${userMessage}"\n\n`;

    if (conversationContext && conversationContext.length > 0) {
      prompt += `Recent conversation context:\n`;
      conversationContext.slice(-3).forEach((msg, i) => {
        prompt += `${i + 1}. "${msg}"\n`;
      });
      prompt += '\n';
    }

    prompt += `Guidelines:
1. Be warm, protective, and directive (not passive)
2. Acknowledge their pain and validate their feelings
3. Direct them to immediate help and resources
4. Show you care deeply about their safety
5. Use 1-2 soft emojis (🛡️, 🌊, 🤍)
6. Keep response under 150 words
7. End with a clear call to action for getting help
8. Do NOT provide clinical advice or diagnosis
9. Focus on getting them connected to real help

${riskLevel === 'critical_emergency' ? 'CRITICAL: This is an emergency situation. Be very direct about getting immediate help.' : ''}`;

    return prompt;
  }

  /**
   * Gets emergency response system prompt
   */
  private getEmergencyResponseSystemPrompt(): string {
    return `You are Buddy, a protective AI friend for students in crisis. Your role in emergency situations is to:

1. Be warm, protective, and directive
2. Validate their feelings without judgment
3. Direct them to immediate help and resources
4. Show deep care and concern for their safety
5. Be clear about getting professional help
6. Never provide clinical advice or diagnosis
7. Focus on connecting them with real people who can help

In critical emergencies:
- Be very direct about calling emergency services
- Emphasize immediate action
- Show protective concern
- Direct them to stay with someone

Remember: You are a friend who cares deeply, but you cannot provide the help they need in a crisis. Your job is to get them connected to real help immediately.`;
  }

  /**
   * Gets default emergency response
   */
  private getDefaultEmergencyResponse(riskLevel: string): string {
    if (riskLevel === 'critical_emergency') {
      return "I care about you so much, and I'm really worried right now. Please call 911 or go to the nearest emergency room immediately. Your safety is the most important thing. Stay with someone you trust until help arrives. I'm here with you, but you need real help right now. 🛡️";
    } else if (riskLevel === 'high_risk') {
      return "I'm really concerned about you and want you to be safe. Please reach out to a trusted adult right now - a parent, counselor, or call 988 for crisis support. You don't have to go through this alone. There are people who want to help you. 🌊";
    } else {
      return "I can hear that you're going through something really difficult, and I want you to know you're not alone. Please consider talking to a counselor or trusted adult about what you're feeling. You deserve support and care. 🤍";
    }
  }

  /**
   * Gets fallback emergency response
   */
  private getFallbackEmergencyResponse(riskLevel: string): EmergencyResponse {
    return {
      response: this.getDefaultEmergencyResponse(riskLevel),
      resources: this.getEmergencyResources(riskLevel),
      requiresImmediateInterruption: riskLevel === 'critical_emergency',
      recommendedActions: this.generateRecommendedActions(riskLevel)
    };
  }

  /**
   * Checks if situation requires emergency handling
   */
  requiresEmergencyHandling(riskLevel: string): boolean {
    return riskLevel === 'critical_emergency' || riskLevel === 'high_risk';
  }

  /**
   * Modifies AI response for emergency situations
   */
  async modifyResponseForEmergency(
    originalResponse: string,
    riskLevel: string,
    userMessage: string,
    conversationContext?: string[]
  ): Promise<string> {
    if (!this.requiresEmergencyHandling(riskLevel)) {
      return originalResponse;
    }

    console.log(`[EmergencyHandler] Modifying response for emergency situation (${riskLevel})`);
    
    const emergencyResponse = await this.generateEmergencyResponse(userMessage, riskLevel, conversationContext);
    return emergencyResponse.response;
  }

  /**
   * Gets crisis intervention message
   */
  getCrisisInterventionMessage(): string {
    return "I care about you deeply, and because I'm just an AI, I can't provide the help you need right now. Please reach out to a real person who can support you - call 988 for crisis support, contact your school counselor, or talk to a trusted adult. Your safety matters too much to handle alone. 🛡️ Would you like me to help you find someone to talk to? 🌊";
  }

  /**
   * Gets resource message for students
   */
  getResourceMessage(): string {
    const resources = this.getEmergencyResources('critical_emergency');
    let message = "Here are resources that can help you:\n\n";
    
    resources.forEach(resource => {
      message += `• ${resource.name}: ${resource.contact} - ${resource.description}\n`;
    });
    
    message += "\nYou are not alone, and there are people who want to help. Please reach out to them. 🤍";
    
    return message;
  }
}

