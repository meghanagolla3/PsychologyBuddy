import { z } from 'zod';

// Category creation validator
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

// Category update validator
export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// Category status update validator
export const UpdateCategoryStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type CreateCategoryData = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryData = z.infer<typeof UpdateCategorySchema>;
export type UpdateCategoryStatusData = z.infer<typeof UpdateCategoryStatusSchema>;
