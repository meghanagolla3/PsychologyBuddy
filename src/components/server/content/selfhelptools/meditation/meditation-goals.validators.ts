import { z } from 'zod';

// Admin Validators
export const CreateMeditationGoalInput = z.object({
  name: z.string().min(1, 'Goal name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const UpdateMeditationGoalInput = z.object({
  name: z.string().min(1, 'Goal name is required').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const DeleteMeditationGoalInput = z.object({
  id: z.string().min(1, 'Goal ID is required'),
});

export const GetMeditationGoalsInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const GetMeditationGoalByIdInput = z.object({
  id: z.string().min(1, 'Goal ID is required'),
});

// Student Validators (Read-only)
export const GetStudentMeditationGoalsInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const GetStudentMeditationGoalByIdInput = z.object({
  id: z.string().min(1, 'Goal ID is required'),
});

// Type exports
export type CreateMeditationGoalInput = z.infer<typeof CreateMeditationGoalInput>;
export type UpdateMeditationGoalInput = z.infer<typeof UpdateMeditationGoalInput>;
export type DeleteMeditationGoalInput = z.infer<typeof DeleteMeditationGoalInput>;
export type GetMeditationGoalsInput = z.infer<typeof GetMeditationGoalsInput>;
export type GetMeditationGoalByIdInput = z.infer<typeof GetMeditationGoalByIdInput>;
export type GetStudentMeditationGoalsInput = z.infer<typeof GetStudentMeditationGoalsInput>;
export type GetStudentMeditationGoalByIdInput = z.infer<typeof GetStudentMeditationGoalByIdInput>;
