// Re-export all services for better IDE support
export { AuthService } from './auth/authService'
export { EmailService } from './auth/emailService'

// Student services
export { 
  ChatService, 
  MoodService, 
  SummaryService, 
  TriggerService 
} from './chats'

// Service types
export type { ServiceResponse } from '@/src/types'
export type { AuthResponse } from '@/src/types'
