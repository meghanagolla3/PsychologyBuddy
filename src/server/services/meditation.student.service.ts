import prisma from "@/src/prisma";
import { z } from "zod";
import { MeditationStudentRepository } from "../repository/meditation.student.repository";
import {
  GetStudentMeditationsSchema,
  GetStudentMeditationByIdSchema,
  GetStudentMeditationCategoriesSchema,
  GetStudentMeditationGoalsSchema,
  GetStudentMeditationInstructionsSchema,
} from "../validators/meditation.validators";

// Type inference from Zod schemas
type GetStudentMeditationsInput = z.infer<typeof GetStudentMeditationsSchema>;
type GetStudentMeditationByIdInput = z.infer<typeof GetStudentMeditationByIdSchema>;
type GetStudentMeditationCategoriesInput = z.infer<typeof GetStudentMeditationCategoriesSchema>;
type GetStudentMeditationGoalsInput = z.infer<typeof GetStudentMeditationGoalsSchema>;
type GetStudentMeditationInstructionsInput = z.infer<typeof GetStudentMeditationInstructionsSchema>;

export class MeditationStudentService {
  private repository: MeditationStudentRepository;

  constructor() {
    this.repository = new MeditationStudentRepository(prisma);
  }
  // ====================================
  //        STUDENT MEDITATION METHODS
  // ====================================

  async getStudentMeditations(data: GetStudentMeditationsInput & { schoolId?: string }) {
    try {
      const { meditations, total } = await this.repository.getStudentMeditations(data);

      return {
        success: true,
        data: meditations,
        pagination: {
          page: data.page,
          limit: data.limit,
          total,
          totalPages: Math.ceil(total / data.limit)
        }
      };
    } catch (error) {
      console.error("Error fetching student meditations:", error);
      return {
        success: false,
        message: "Failed to fetch meditations",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getStudentMeditationById(data: GetStudentMeditationByIdInput & { schoolId?: string }) {
    try {
      const meditation = await this.repository.getStudentMeditationById(data.id, data.schoolId);

      if (!meditation) {
        return {
          success: false,
          message: "Meditation not found"
        };
      }

      return {
        success: true,
        data: meditation
      };
    } catch (error) {
      console.error("Error fetching student meditation:", error);
      return {
        success: false,
        message: "Failed to fetch meditation",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getStudentMeditationCategories(data: GetStudentMeditationCategoriesInput) {
    try {
      const { categories, total } = await this.repository.getStudentMeditationCategories(data);

      return {
        success: true,
        data: categories,
        pagination: {
          page: data.page,
          limit: data.limit,
          total,
          totalPages: Math.ceil(total / data.limit)
        }
      };
    } catch (error) {
      console.error("Error fetching student meditation categories:", error);
      return {
        success: false,
        message: "Failed to fetch meditation categories",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getStudentMeditationGoals(data: GetStudentMeditationGoalsInput) {
    try {
      const { goals, total } = await this.repository.getStudentMeditationGoals(data);

      return {
        success: true,
        data: goals,
        pagination: {
          page: data.page,
          limit: data.limit,
          total,
          totalPages: Math.ceil(total / data.limit)
        }
      };
    } catch (error) {
      console.error("Error fetching student meditation goals:", error);
      return {
        success: false,
        message: "Failed to fetch meditation goals",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getStudentMeditationInstructions(data: GetStudentMeditationInstructionsInput & { schoolId?: string }) {
    try {
      const { instructions, total } = await this.repository.getStudentMeditationInstructions(data);

      return {
        success: true,
        data: instructions,
        pagination: {
          page: data.page,
          limit: data.limit,
          total,
          totalPages: Math.ceil(total / data.limit)
        }
      };
    } catch (error) {
      console.error("Error fetching student meditation instructions:", error);
      return {
        success: false,
        message: "Failed to fetch meditation instructions",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}
