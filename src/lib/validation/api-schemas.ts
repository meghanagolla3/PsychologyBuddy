import { z } from 'zod'
import { AuthMiddleware } from '../auth/auth-middleware'

// Base schemas 
const MoodEnum = z.enum(['Happy', 'Okay', 'Sad', 'Anxious', 'Tired'])
const MessageRoleEnum = z.enum(['user', 'assistant'])

// Request schemas
export const MoodCheckinSchema = z.object({
  mood: MoodEnum,
  triggers: z.array(z.string()).optional(),
  notes: z.string().optional()
})

export const TriggerSelectionSchema = z.object({
  triggers: z.array(z.string()).min(1, 'At least one trigger must be selected'),
  notes: z.string().optional()
})

export const ChatMessageSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  message: z.string().min(1, 'Message cannot be empty')
})

export const SummaryGenerateSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  conversation: z.array(z.object({
    role: MessageRoleEnum,
    content: z.string().min(1, 'Message content cannot be empty')
  })).min(1, 'Conversation must have at least one message')
})

// Response schemas for type safety
export const MoodCheckinResponseSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  mood: MoodEnum,
  notes: z.string().nullable(),
  date: z.date(),
  createdAt: z.date()
})

export const TriggerSelectionResponseSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  triggers: z.array(z.string()),
  notes: z.string().nullable(),
  createdAt: z.date()
})

export const ChatSessionResponseSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  mood: z.string().nullable(),
  trigger: z.string().nullable(),
  customTrigger: z.string().nullable(),
  startedAt: z.date(),
  endedAt: z.date().nullable(),
  isActive: z.boolean()
})

// Validation helper class
export class ValidationService {
  static validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        throw new Error(`Validation failed: ${formattedErrors.map((e: any) => e.message).join(', ')}`)
      }
      throw error
    }
  }
  
  static handleValidationError(error: any): Response {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
      
      return AuthMiddleware.createErrorResponse(
        'Validation failed',
        400,
        formattedErrors
      )
    }
    
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return AuthMiddleware.createErrorResponse(error.message, 400)
    }
    
    return AuthMiddleware.handleApiError(error)
  }
}

// Export individual functions for backward compatibility
export const handleValidationError = ValidationService.handleValidationError.bind(ValidationService)

// Type exports
export type MoodCheckinRequest = z.infer<typeof MoodCheckinSchema>
export type TriggerSelectionRequest = z.infer<typeof TriggerSelectionSchema>
export type ChatMessageRequest = z.infer<typeof ChatMessageSchema>
export type SummaryGenerateRequest = z.infer<typeof SummaryGenerateSchema>

export type MoodCheckinResponse = z.infer<typeof MoodCheckinResponseSchema>
export type TriggerSelectionResponse = z.infer<typeof TriggerSelectionResponseSchema>
export type ChatSessionResponse = z.infer<typeof ChatSessionResponseSchema>
