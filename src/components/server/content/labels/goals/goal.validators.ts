import { z } from 'zod';

// Goal creation validator
export const CreateGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Goal name must be less than 100 characters'),
});

// Goal update validator
export const UpdateGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Goal name must be less than 100 characters').optional(),
});

export type CreateGoalData = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalData = z.infer<typeof UpdateGoalSchema>;
