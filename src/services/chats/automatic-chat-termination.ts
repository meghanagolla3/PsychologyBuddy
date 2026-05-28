import { ConversationAnalyzer, ConversationAnalysis, Message } from '../conversation-analysis';

export interface ChatTerminationResult {
  shouldTerminate: boolean;
  reason: string;
  analysis: ConversationAnalysis;
  closingMessage?: string;
}

export class AutomaticChatTermination {
  private static maxSessionDuration = Number(process.env.CHAT_SESSION_DURATION_MINUTES || 360) * 60 * 1000; // Configurable: default 5 minutes
  private static warningTime = Number(process.env.CHAT_WARNING_TIME_MINUTES || 1) * 60 * 1000; // Configurable: default 1 minute

  /**
   * Configure session duration settings
   */
  static configureSessionDuration(maxDurationMinutes: number, warningTimeMinutes: number) {
    AutomaticChatTermination.maxSessionDuration = maxDurationMinutes * 60 * 1000;
    AutomaticChatTermination.warningTime = warningTimeMinutes * 60 * 1000;
    console.log(`[AutoTermination] Session duration configured: ${maxDurationMinutes}min max, ${warningTimeMinutes}min warning`);
  }

  /**
   * Get current configuration
   */
  static getConfiguration() {
    return {
      maxSessionDurationMinutes: AutomaticChatTermination.maxSessionDuration / 60 / 1000,
      warningTimeMinutes: AutomaticChatTermination.warningTime / 60 / 1000
    };
  }

  /**
   * Checks if session should terminate based only on time
   */
  static shouldTerminateChat(
    messages: Message[],
    sessionId: string,
    sessionStartTime?: number
  ): ChatTerminationResult {
    console.log(`[AutoTermination] Checking time limit for session ${sessionId}`);
    
    // Only check time-based termination
    if (sessionStartTime) {
      const currentTime = Date.now();
      const sessionDuration = currentTime - sessionStartTime;
      
      console.log(`[AutoTermination] Session duration: ${Math.round(sessionDuration / 1000)}s, max: ${Math.round(AutomaticChatTermination.maxSessionDuration / 1000)}s`);
      
      // Force termination if session exceeds max duration
      if (sessionDuration >= AutomaticChatTermination.maxSessionDuration) {
        console.log(`[AutoTermination] TIME LIMIT REACHED - Terminating session`);
        return {
          shouldTerminate: true,
          reason: 'Time limit reached',
          analysis: {
            shouldEnd: true,
            reason: 'Session time limit exceeded',
            completionScore: 100,
            nextSteps: [],
            emotionalProgress: { improvement: false },
            conversationQuality: { depth: 'moderate', engagement: 'medium', resolution: 'partial' }
          },
          closingMessage: "I've enjoyed our conversation and will generate a summary for you to review later. Take care!"
        };
      }
    }

    // Not time to terminate yet
    return {
      shouldTerminate: false,
      reason: 'Session active',
      analysis: {
        shouldEnd: false,
        reason: 'Session ongoing',
        completionScore: 0,
        nextSteps: [],
        emotionalProgress: { improvement: false },
        conversationQuality: { depth: 'shallow', engagement: 'low', resolution: 'none' }
      }
    };
  }

  /**
   * Gets the remaining time for a session
   */
  static getRemainingSessionTime(sessionStartTime: number): number {
    const currentTime = Date.now();
    const elapsed = currentTime - sessionStartTime;
    return Math.max(0, AutomaticChatTermination.maxSessionDuration - elapsed);
  }

  /**
   * Checks if session should show time warning
   */
  static shouldShowTimeWarning(sessionStartTime: number): boolean {
    const remaining = AutomaticChatTermination.getRemainingSessionTime(sessionStartTime);
    return remaining > 0 && remaining <= AutomaticChatTermination.warningTime;
  }

  /**
   * Gets session duration in seconds
   */
  static getSessionDuration(sessionStartTime: number): number {
    return Math.round((Date.now() - sessionStartTime) / 1000);
  }

  }
