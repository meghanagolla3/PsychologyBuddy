import { z } from 'zod';

// Base schemas
export const MeditationStatusEnum = z.enum(['DRAFT', 'PUBLISHED']);
export const MeditationTypeEnum = z.enum(['GUIDED', 'MUSIC', 'BREATHING', 'BODY_SCAN']);
export const MeditationFormatEnum = z.enum(['AUDIO', 'VIDEO', 'TEXT']);

// Admin Validators
export const CreateMeditationInput = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  thumbnailUrl: z.string().url().optional(),
  format: MeditationFormatEnum,
  audioUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  durationSec: z.number().min(1, 'Duration is required').optional(),
  instructor: z.string().optional(),
  type: MeditationTypeEnum.default('GUIDED'),
  category: z.string().optional(),
  goal: z.string().optional(),
  status: MeditationStatusEnum.default('DRAFT'),
  schoolId: z.string().optional(),
  moods: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export const UpdateMeditationInput = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  thumbnailUrl: z.string().url().optional(),
  format: MeditationFormatEnum.optional(),
  audioUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  durationSec: z.number().min(1, 'Duration is required').optional(),
  instructor: z.string().optional(),
  type: MeditationTypeEnum.optional(),
  category: z.string().optional(),
  goal: z.string().optional(),
  status: MeditationStatusEnum.optional(),
  moods: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export const DeleteMeditationInput = z.object({
  id: z.string().min(1, 'Meditation ID is required'),
});

export const GetMeditationsInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: MeditationTypeEnum.optional(),
  status: MeditationStatusEnum.optional(),
  category: z.string().optional(),
  goal: z.string().optional(),
  schoolId: z.string().optional(),
});

export const GetMeditationByIdInput = z.object({
  id: z.string().min(1, 'Meditation ID is required'),
});

// Student Validators (Read-only)
export const GetStudentMeditationsInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: MeditationTypeEnum.optional(),
  category: z.string().optional(),
  goal: z.string().optional(),
});

export const GetStudentMeditationByIdInput = z.object({
  id: z.string().min(1, 'Meditation ID is required'),
});

export const GetMeditationsByTypeInput = z.object({
  type: MeditationTypeEnum,
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const GetMeditationsByCategoryInput = z.object({
  category: z.string().min(1, 'Category is required'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const GetMeditationsByGoalInput = z.object({
  goal: z.string().min(1, 'Goal is required'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Meditation Listening Instructions Validators
export const CreateMeditationInstructionInput = z.object({
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

export const UpdateMeditationInstructionInput = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  steps: z.array(z.object({
    stepNumber: z.number().min(1, 'Step number is required'),
    title: z.string().min(1, 'Step title is required'),
    description: z.string().min(1, 'Step description is required'),
    duration: z.number().min(1, 'Step duration is required').optional(),
    resources: z.array(z.string()).optional(),
  })).min(1, 'At least one step is required').optional(),
  duration: z.number().min(1, 'Duration is required').optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  resourceId: z.string().optional(),
});

export const DeleteMeditationInstructionInput = z.object({
  id: z.string().min(1, 'Instruction ID is required'),
});

export const GetMeditationInstructionsInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  resourceId: z.string().optional(),
});

export const GetMeditationInstructionByIdInput = z.object({
  id: z.string().min(1, 'Instruction ID is required'),
});

// Student Instruction Validators
export const GetStudentMeditationInstructionsInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  resourceId: z.string().optional(),
});

export const GetStudentMeditationInstructionByIdInput = z.object({
  id: z.string().min(1, 'Instruction ID is required'),
});

export const GetMeditationInstructionsByDifficultyInput = z.object({
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const GetMeditationInstructionsByResourceInput = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Type exports
export type CreateMeditationInput = z.infer<typeof CreateMeditationInput>;
export type UpdateMeditationInput = z.infer<typeof UpdateMeditationInput>;
export type DeleteMeditationInput = z.infer<typeof DeleteMeditationInput>;
export type GetMeditationsInput = z.infer<typeof GetMeditationsInput>;
export type GetMeditationByIdInput = z.infer<typeof GetMeditationByIdInput>;
export type GetStudentMeditationsInput = z.infer<typeof GetStudentMeditationsInput>;
export type GetStudentMeditationByIdInput = z.infer<typeof GetStudentMeditationByIdInput>;
export type GetMeditationsByTypeInput = z.infer<typeof GetMeditationsByTypeInput>;
export type GetMeditationsByCategoryInput = z.infer<typeof GetMeditationsByCategoryInput>;
export type GetMeditationsByGoalInput = z.infer<typeof GetMeditationsByGoalInput>;

export type CreateMeditationInstructionInput = z.infer<typeof CreateMeditationInstructionInput>;
export type UpdateMeditationInstructionInput = z.infer<typeof UpdateMeditationInstructionInput>;
export type DeleteMeditationInstructionInput = z.infer<typeof DeleteMeditationInstructionInput>;
export type GetMeditationInstructionsInput = z.infer<typeof GetMeditationInstructionsInput>;
export type GetMeditationInstructionByIdInput = z.infer<typeof GetMeditationInstructionByIdInput>;
export type GetStudentMeditationInstructionsInput = z.infer<typeof GetStudentMeditationInstructionsInput>;
export type GetStudentMeditationInstructionByIdInput = z.infer<typeof GetStudentMeditationInstructionByIdInput>;
export type GetMeditationInstructionsByDifficultyInput = z.infer<typeof GetMeditationInstructionsByDifficultyInput>;
export type GetMeditationInstructionsByResourceInput = z.infer<typeof GetMeditationInstructionsByResourceInput>;
