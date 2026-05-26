/**
 * Context Manager for Conversational Memory
 * 
 * This module handles:
 * - Token counting for messages
 * - Smart context window management
 * - Conversation summarization for overflow prevention
 * - Maintaining conversation history within token limits
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ContextWindowConfig {
  maxTokens: number;
  systemPromptTokens: number;
  reserveTokens: number;
}

export interface ContextSummary {
  summary: string;
  messageCount: number;
  timestamp: Date;
}

/**
 * Approximate token counter for text
 * Uses a simple heuristic: ~4 characters per token for English text
 * This is less accurate than tiktoken but faster and doesn't require external dependencies
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Count tokens in an array of messages
 */
export function countMessageTokens(messages: ChatMessage[]): number {
  return messages.reduce((total, msg) => {
    return total + estimateTokens(msg.content);
  }, 0);
}

/**
 * Default context window configuration for GPT-3.5-turbo
 * GPT-3.5-turbo has a 4K token context window
 * We reserve tokens for the system prompt and response generation
 */
export const DEFAULT_CONTEXT_CONFIG: ContextWindowConfig = {
  maxTokens: 4000,
  systemPromptTokens: 500, // Estimated tokens for system prompt
  reserveTokens: 500, // Reserve for AI response generation
};

/**
 * Get available tokens for conversation history
 */
export function getAvailableHistoryTokens(config: ContextWindowConfig = DEFAULT_CONTEXT_CONFIG): number {
  return config.maxTokens - config.systemPromptTokens - config.reserveTokens;
}

/**
 * Select messages to include in context based on token limits
 * Prioritizes recent messages while including as much history as possible
 */
export function selectContextMessages(
  messages: ChatMessage[],
  config: ContextWindowConfig = DEFAULT_CONTEXT_CONFIG
): ChatMessage[] {
  const availableTokens = getAvailableHistoryTokens(config);
  
  // If all messages fit, return them all
  const totalTokens = countMessageTokens(messages);
  if (totalTokens <= availableTokens) {
    return messages;
  }
  
  // Otherwise, select messages from the end (most recent)
  // This ensures the most recent context is preserved
  const selectedMessages: ChatMessage[] = [];
  let currentTokens = 0;
  
  // Iterate from the end to include most recent messages
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const msgTokens = estimateTokens(msg.content);
    
    if (currentTokens + msgTokens <= availableTokens) {
      selectedMessages.unshift(msg);
      currentTokens += msgTokens;
    } else {
      break;
    }
  }
  
  return selectedMessages;
}

/**
 * Generate a summary of conversation messages
 * This is used when context exceeds limits and we need to compress older messages
 */
export async function generateConversationSummary(
  messages: ChatMessage[],
  openai: any
): Promise<string> {
  if (messages.length === 0) {
    return '';
  }
  
  // Build a prompt for summarization
  const summaryPrompt = `
Summarize the following conversation in 2-3 sentences. Focus on:
- The main topics discussed
- Key emotions or concerns expressed
- Any important details that should be remembered

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Provide a concise summary that captures the essence of the conversation.
`;
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: summaryPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    });
    
    return response.choices[0]?.message?.content || 'Previous conversation discussed various topics.';
  } catch (error) {
    console.error('Failed to generate conversation summary:', error);
    // Fallback: simple concatenation of first few messages
    const topics = messages.slice(0, 3).map(m => m.content.substring(0, 50)).join('; ');
    return `Previous conversation covered: ${topics}...`;
  }
}

/**
 * Build context with smart memory management
 * Includes system prompt, recent messages, and summary if needed
 */
export async function buildConversationContext(
  systemPrompt: string,
  conversationHistory: ChatMessage[],
  currentMessage: string,
  openai: any,
  config: ContextWindowConfig = DEFAULT_CONTEXT_CONFIG
): Promise<ChatMessage[]> {
  const systemPromptTokens = estimateTokens(systemPrompt);
  const currentMessageTokens = estimateTokens(currentMessage);
  
  // Calculate available tokens for history
  const availableForHistory = config.maxTokens - systemPromptTokens - currentMessageTokens - config.reserveTokens;
  
  // Build full message array
  const allMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: currentMessage }
  ];
  
  const totalTokens = countMessageTokens(allMessages);
  
  // If everything fits, return as-is
  if (totalTokens <= config.maxTokens) {
    return allMessages;
  }
  
  // If we need to compress, try including summary + recent messages
  if (conversationHistory.length > 5) {
    // Split history: older messages for summary, recent messages to keep
    const splitPoint = Math.floor(conversationHistory.length / 2);
    const olderMessages = conversationHistory.slice(0, splitPoint);
    const recentMessages = conversationHistory.slice(splitPoint);
    
    // Generate summary of older messages
    const summary = await generateConversationSummary(olderMessages, openai);
    const summaryTokens = estimateTokens(summary);
    const recentTokens = countMessageTokens(recentMessages);
    
    // Check if summary + recent messages fit
    if (summaryTokens + recentTokens + systemPromptTokens + currentMessageTokens + config.reserveTokens <= config.maxTokens) {
      return [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: `Previous conversation summary: ${summary}` },
        ...recentMessages,
        { role: 'user', content: currentMessage }
      ];
    }
  }
  
  // Fallback: Just include most recent messages that fit
  const selectedHistory = selectContextMessages(conversationHistory, {
    ...config,
    systemPromptTokens: systemPromptTokens + currentMessageTokens
  });
  
  return [
    { role: 'system', content: systemPrompt },
    ...selectedHistory,
    { role: 'user', content: currentMessage }
  ];
}

/**
 * Format database messages for AI context
 */
export function formatMessagesForAI(messages: any[]): ChatMessage[] {
  return messages.map(msg => ({
    role: msg.senderType === 'STUDENT' ? 'user' : 'assistant',
    content: msg.content
  }));
}
