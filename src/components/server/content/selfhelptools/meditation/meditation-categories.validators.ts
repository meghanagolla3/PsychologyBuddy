import { z } from 'zod';

// Base schemas
export const MeditationCategoryStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

// Admin Validators
export const CreateMeditationCategoryInput = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  status: MeditationCategoryStatusEnum.default('ACTIVE'),
});

export const UpdateMeditationCategoryInput = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  status: MeditationCategoryStatusEnum.optional(),
});

export const DeleteMeditationCategoryInput = z.object({
  id: z.string().min(1, 'Category ID is required'),
});

export const GetMeditationCategoriesInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: MeditationCategoryStatusEnum.optional(),
});

export const GetMeditationCategoryByIdInput = z.object({
  id: z.string().min(1, 'Category ID is required'),
});

// Student Validators (Read-only)
export const GetStudentMeditationCategoriesInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const GetStudentMeditationCategoryByIdInput = z.object({
  id: z.string().min(1, 'Category ID is required'),
});

// Type exports
export type CreateMeditationCategoryInput = z.infer<typeof CreateMeditationCategoryInput>;
export type UpdateMeditationCategoryInput = z.infer<typeof UpdateMeditationCategoryInput>;
export type DeleteMeditationCategoryInput = z.infer<typeof DeleteMeditationCategoryInput>;
export type GetMeditationCategoriesInput = z.infer<typeof GetMeditationCategoriesInput>;
export type GetMeditationCategoryByIdInput = z.infer<typeof GetMeditationCategoryByIdInput>;
export type GetStudentMeditationCategoriesInput = z.infer<typeof GetStudentMeditationCategoriesInput>;
export type GetStudentMeditationCategoryByIdInput = z.infer<typeof GetStudentMeditationCategoryByIdInput>;
