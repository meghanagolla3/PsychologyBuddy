import { z } from 'zod';

// Admin Music Resource Management
export const CreateMusicResourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  url: z.string().url('Valid audio URL is required'),
  duration: z.number().min(1, 'Duration must be at least 1 second').optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  categoryIds: z.array(z.string()).default([]),
  goalIds: z.array(z.string()).default([]),
});

export const UpdateMusicResourceSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 second').optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  categoryIds: z.array(z.string()).optional(),
  goalIds: z.array(z.string()).optional(),
});

export const DeleteMusicResourceSchema = z.object({
  id: z.string().min(1, 'Music resource ID is required'),
});

// Category Management
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const DeleteCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
});

// Goal Management  
export const CreateGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const UpdateGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const DeleteGoalSchema = z.object({
  id: z.string().min(1, 'Goal ID is required'),
});

// Student Music Instruction (READ ONLY for music resources)
export const GetMusicResourcesSchema = z.object({
  category: z.string().optional(),
  goal: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const GetMusicResourceByIdSchema = z.object({
  id: z.string().min(1, 'Music resource ID is required'),
});

// Type exports
export type CreateMusicResourceInput = z.infer<typeof CreateMusicResourceSchema>;
export type UpdateMusicResourceInput = z.infer<typeof UpdateMusicResourceSchema>;
export type DeleteMusicResourceInput = z.infer<typeof DeleteMusicResourceSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof DeleteCategorySchema>;
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
export type DeleteGoalInput = z.infer<typeof DeleteGoalSchema>;
export type GetMusicResourcesInput = z.infer<typeof GetMusicResourcesSchema>;
export type GetMusicResourceByIdInput = z.infer<typeof GetMusicResourceByIdSchema>;
