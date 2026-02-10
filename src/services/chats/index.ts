// Re-export all student services for better IDE support
export { ChatService } from './chatService'
export { MoodService } from './moodService'
export { SummaryService } from './summaryService'
export { TriggerService } from './triggerService'

// Service types
export type { 
  ChatSessionData, 
  ChatMessage, 
  ChatStartResponse 
} from './chatService'

export type { 
  MoodCheckinData, 
  MoodAnalytics 
} from './moodService'

export type { 
  SummaryGenerationData,
  StructuredSummaryResponse as SummaryResponse
} from './summaryService'

export type { 
  TriggerSelectionData, 
  TriggerAnalytics 
} from './triggerService'
