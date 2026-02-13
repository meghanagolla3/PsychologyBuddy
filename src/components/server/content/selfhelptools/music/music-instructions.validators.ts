import { z } from 'zod';

// Admin Music Listening Instructions Management
export const CreateInstructionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  steps: z.array(z.object({
    stepNumber: z.number().min(1, 'Step number is required'),
    title: z.string().min(1, 'Step title is required'),
    description: z.string().min(1, 'Step description is required'),
    duration: z.number().min(1, 'Step duration is required').optional(),
    resources: z.array(z.string()).optional(),
  })).min(1, 'At least one step is required'),
  duration: z.number().min(1, 'Duration is required').optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  resourceId: z.string().optional(),
});

export const UpdateInstructionSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  steps: z.array(z.object({
    stepNumber: z.number().min(1, 'Step number is required'),
    title: z.string().min(1, 'Step title is required'),
    description: z.string().min(1, 'Step description is required'),
    duration: z.number().min(1, 'Step duration is required').optional(),
    resources: z.array(z.string()).optional(),
  })).optional(),
  duration: z.number().min(1, 'Duration is required').optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  resourceId: z.string().optional(),
});

export const DeleteInstructionSchema = z.object({
  id: z.string().min(1, 'Instruction ID is required'),
});

// Student Music Listening Instructions (READ ONLY)
export const GetInstructionsSchema = z.object({
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const GetInstructionByIdSchema = z.object({
  id: z.string().min(1, 'Instruction ID is required'),
});

// Type exports
export type CreateInstructionInput = z.infer<typeof CreateInstructionSchema>;
export type UpdateInstructionInput = z.infer<typeof UpdateInstructionSchema>;
export type DeleteInstructionInput = z.infer<typeof DeleteInstructionSchema>;
export type GetInstructionsInput = z.infer<typeof GetInstructionsSchema>;
export type GetInstructionByIdInput = z.infer<typeof GetInstructionByIdSchema>;
