import { z } from 'zod';

export const CreateMusicMoodSchema = z.object({
  name: z.string().min(1, "Mood name is required").max(50, "Mood name must be 50 characters or less"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")
});

export const UpdateMusicMoodSchema = z.object({
  name: z.string().min(1, "Mood name is required").max(50, "Mood name must be 50 characters or less").optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional()
});

export type CreateMusicMoodInput = z.infer<typeof CreateMusicMoodSchema>;
export type UpdateMusicMoodInput = z.infer<typeof UpdateMusicMoodSchema>;
