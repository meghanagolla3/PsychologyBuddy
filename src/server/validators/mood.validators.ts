import { z } from 'zod';

// Mood creation validator
export const CreateMoodSchema = z.object({
  name: z.string().min(1, 'Mood name is required').max(100, 'Mood name must be less than 100 characters'),
});

// Mood update validator
export const UpdateMoodSchema = z.object({
  name: z.string().min(1, 'Mood name is required').max(100, 'Mood name must be less than 100 characters').optional(),
});

export type CreateMoodData = z.infer<typeof CreateMoodSchema>;
export type UpdateMoodData = z.infer<typeof UpdateMoodSchema>;
