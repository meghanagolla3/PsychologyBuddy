// Re-export all services for better IDE support
export { AuthService } from '../server/services/auth.service'

// Student services
export { 
  ChatService, 
  MoodService, 
  SummaryService, 
  TriggerService 
} from './chats'

// Service types
export type { ApiResponse } from '@/src/types/api.types'
