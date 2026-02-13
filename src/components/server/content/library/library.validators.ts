import { z } from 'zod';

// Article creation validator
export const CreateArticleSchema = z.object({
  title: z.string().min(1, 'Article title is required'),
  author: z.string().min(1, 'Author is required'),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  readTime: z.number().int().min(1, 'Read time must be at least 1 minute').optional(),
  description: z.string().min(1, 'Short description is required'),
  categoryIds: z.array(z.string()).optional(),
  moodIds: z.array(z.string()).optional(),
  goalIds: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

// Article update validator
export const UpdateArticleSchema = z.object({
  title: z.string().min(1, 'Article title is required').optional(),
  author: z.string().min(1, 'Author is required').optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  readTime: z.number().int().min(1, 'Read time must be at least 1 minute').optional(),
  description: z.string().min(1, 'Short description is required').optional(),
  categoryIds: z.array(z.string()).optional(),
  moodIds: z.array(z.string()).optional(),
  goalIds: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

// Article status update validator
export const UpdateArticleStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export type CreateArticleData = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleData = z.infer<typeof UpdateArticleSchema>;
export type UpdateArticleStatusData = z.infer<typeof UpdateArticleStatusSchema>;
