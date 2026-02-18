import { z } from "zod";

// ====================================
//        MEDITATION RESOURCE SCHEMAS
// ====================================

// Base schema for both create and update
const BaseMeditationResourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  thumbnailUrl: z.string().url().optional().nullable(),
  format: z.enum(["AUDIO", "VIDEO", "TEXT"]),
  audioUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  durationSec: z.number().int().positive().optional().nullable(),
  instructor: z.string().optional().nullable(),
  type: z.enum(["GUIDED", "MUSIC", "BREATHING", "BODY_SCAN"]).default("GUIDED"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  categoryIds: z.array(z.string()).optional(),
  moodIds: z.array(z.string()).optional(),
  goalIds: z.array(z.string()).optional(),
  // Support legacy single field format
  category: z.string().optional(),
  mood: z.string().optional(),
  goal: z.string().optional(),
});

// Transform legacy fields to array format
export const CreateMeditationResourceSchema = BaseMeditationResourceSchema.transform((data) => {
  const transformed = { ...data };
  
  // Convert legacy single fields to array format
  if (data.category && !data.categoryIds?.includes(data.category)) {
    transformed.categoryIds = [...(data.categoryIds || []), data.category];
  }
  
  if (data.mood && !data.moodIds?.includes(data.mood)) {
    transformed.moodIds = [...(data.moodIds || []), data.mood];
  }
  
  if (data.goal && !data.goalIds?.includes(data.goal)) {
    transformed.goalIds = [...(data.goalIds || []), data.goal];
  }
  
  // Remove legacy fields
  delete transformed.category;
  delete transformed.mood;
  delete transformed.goal;
  
  return transformed;
});

export const UpdateMeditationResourceSchema = BaseMeditationResourceSchema.partial().transform((data) => {
  const transformed = { ...data };
  
  // Convert legacy single fields to array format
  if (data.category && !data.categoryIds?.includes(data.category)) {
    transformed.categoryIds = [...(data.categoryIds || []), data.category];
  }
  
  if (data.mood && !data.moodIds?.includes(data.mood)) {
    transformed.moodIds = [...(data.moodIds || []), data.mood];
  }
  
  if (data.goal && !data.goalIds?.includes(data.goal)) {
    transformed.goalIds = [...(data.goalIds || []), data.goal];
  }
  
  // Remove legacy fields
  delete transformed.category;
  delete transformed.mood;
  delete transformed.goal;
  
  return transformed;
});

export const GetMeditationResourcesSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  format: z.enum(["AUDIO", "VIDEO", "TEXT"]).optional(),
  type: z.enum(["GUIDED", "MUSIC", "BREATHING", "BODY_SCAN"]).optional(),
  categoryId: z.string().optional(),
  moodId: z.string().optional(),
  goalId: z.string().optional(),
  // Support array parameters for multiple filters
  categoryIds: z.array(z.string()).optional(),
  moodIds: z.array(z.string()).optional(),
  goalIds: z.array(z.string()).optional(),
}).transform((data) => {
  // Handle array parameters from query string
  const transformed = { ...data };
  
  // If single ID is provided, convert to array
  if (data.categoryId && !data.categoryIds?.includes(data.categoryId)) {
    transformed.categoryIds = [...(data.categoryIds || []), data.categoryId];
  }
  
  if (data.moodId && !data.moodIds?.includes(data.moodId)) {
    transformed.moodIds = [...(data.moodIds || []), data.moodId];
  }
  
  if (data.goalId && !data.goalIds?.includes(data.goalId)) {
    transformed.goalIds = [...(data.goalIds || []), data.goalId];
  }
  
  return transformed;
});

export const GetSingleMeditationResourceSchema = z.object({
  id: z.string().min(1, "Meditation ID is required"),
});

// ====================================
//        MEDITATION CATEGORY SCHEMAS
// ====================================

export const CreateMeditationCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const UpdateMeditationCategorySchema = CreateMeditationCategorySchema.partial();

export const GetMeditationCategoriesSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const GetSingleMeditationCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
});

// ====================================
//           MEDITATION GOAL SCHEMAS
// ====================================

export const CreateMeditationGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const UpdateMeditationGoalSchema = CreateMeditationGoalSchema.partial();

export const GetMeditationGoalsSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const GetSingleMeditationGoalSchema = z.object({
  id: z.string().min(1, "Goal ID is required"),
});

// ====================================
//     MEDITATION INSTRUCTION SCHEMAS
// ====================================

export const CreateMeditationInstructionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  steps: z.array(z.any()), // JSON array of instruction steps
  duration: z.number().int().positive().optional().nullable(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  resourceId: z.string().optional().nullable(),
  proTip: z.string().optional().nullable(),
});

export const UpdateMeditationInstructionSchema = CreateMeditationInstructionSchema.partial();

export const GetMeditationInstructionsSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});

export const GetSingleMeditationInstructionSchema = z.object({
  id: z.string().min(1, "Instruction ID is required"),
});

export const GetInstructionsByResourceSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),
});

// ====================================
//           STUDENT SCHEMAS
// ====================================

export const GetStudentMeditationsSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  moodId: z.string().optional(),
  goalId: z.string().optional(),
  format: z.enum(["AUDIO", "VIDEO", "TEXT"]).optional(),
  type: z.enum(["GUIDED", "MUSIC", "BREATHING", "BODY_SCAN"]).optional(),
});

export const GetStudentMeditationByIdSchema = z.object({
  id: z.string().min(1, "Meditation ID is required"),
});

export const GetStudentMeditationCategoriesSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  search: z.string().optional(),
});

export const GetStudentMeditationGoalsSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  search: z.string().optional(),
});

export const GetStudentMeditationInstructionsSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
  search: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});

// ====================================
//        MEDITATION MOOD SCHEMAS
// ====================================

export const CreateMeditationMoodSchema = z.object({
  name: z.string().min(1, "Mood name is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
