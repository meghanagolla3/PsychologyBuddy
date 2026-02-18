import { PrismaClient } from '@/src/generated/prisma/client';
import { z } from "zod";
import {
  CreateMeditationResourceSchema,
  UpdateMeditationResourceSchema,
  CreateMeditationCategorySchema,
  UpdateMeditationCategorySchema,
  CreateMeditationGoalSchema,
  UpdateMeditationGoalSchema,
  CreateMeditationInstructionSchema,
  UpdateMeditationInstructionSchema,
} from "../validators/meditation.validators";

// Type inference from Zod schemas
type CreateMeditationResourceInput = z.infer<typeof CreateMeditationResourceSchema>;
type UpdateMeditationResourceInput = z.infer<typeof UpdateMeditationResourceSchema>;
type CreateMeditationCategoryInput = z.infer<typeof CreateMeditationCategorySchema>;
type UpdateMeditationCategoryInput = z.infer<typeof UpdateMeditationCategorySchema>;
type CreateMeditationGoalInput = z.infer<typeof CreateMeditationGoalSchema>;
type UpdateMeditationGoalInput = z.infer<typeof UpdateMeditationGoalSchema>;
type CreateMeditationInstructionInput = z.infer<typeof CreateMeditationInstructionSchema>;
type UpdateMeditationInstructionInput = z.infer<typeof UpdateMeditationInstructionSchema>;

export class MeditationRepository {
  constructor(private prisma: PrismaClient) {}

  // ====================================
  //        MEDITATION RESOURCE OPERATIONS
  // ====================================

  async createMeditationResource(data: CreateMeditationResourceInput & { schoolId?: string; createdBy: string }) {
    const { categoryIds, moodIds, goalIds, category, mood, goal, schoolId, createdBy, ...resourceData } = data;

    // Combine legacy and new field formats
    const allCategoryIds = [...(categoryIds || [])];
    if (category && !allCategoryIds.includes(category)) {
      allCategoryIds.push(category);
    }
    
    const allMoodIds = [...(moodIds || [])];
    if (mood && !allMoodIds.includes(mood)) {
      allMoodIds.push(mood);
    }
    
    const allGoalIds = [...(goalIds || [])];
    if (goal && !allGoalIds.includes(goal)) {
      allGoalIds.push(goal);
    }

    return this.prisma.$transaction(async (tx) => {
      // Create the meditation with relations in a single transaction
      const meditation = await tx.meditation.create({
        data: {
          ...resourceData,
          ...(schoolId && { schoolId }),
          createdBy,
          // Create relations in the same transaction
          ...(allCategoryIds.length > 0 && {
            categories: {
              create: allCategoryIds.map((categoryId: string) => ({
                category: { connect: { id: categoryId } }
              }))
            }
          }),
          ...(allMoodIds.length > 0 && {
            moods: {
              create: allMoodIds.map((moodId: string) => ({
                mood: { connect: { id: moodId } }
              }))
            }
          }),
          ...(allGoalIds.length > 0 && {
            goals: {
              create: allGoalIds.map((goalId: string) => ({
                goal: { connect: { id: goalId } }
              }))
            }
          })
        },
        include: {
          moods: {
            include: {
              mood: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          goals: {
            include: {
              goal: true,
            },
          },
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return meditation;
    });
  }

  async getMeditationResources(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    format?: string;
    type?: string;
    categoryId?: string;
    moodId?: string;
    goalId?: string;
    schoolId?: string;
  }) {
    const { page, limit, search, status, format, type, categoryId, moodId, goalId, schoolId } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null, // Exclude soft-deleted records
      ...(schoolId && { schoolId }),
      ...(status && { status }),
      ...(format && { format }),
      ...(type && { type }),
    };

    // Add search conditions
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { instructor: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add filter conditions
    if (categoryId || moodId || goalId) {
      where.AND = [];
      if (categoryId) {
        where.AND.push({
          categories: {
            some: {
              category: { id: categoryId },
            },
          },
        });
      }
      if (moodId) {
        where.AND.push({
          moods: {
            some: {
              mood: { id: moodId },
            },
          },
        });
      }
      if (goalId) {
        where.AND.push({
          goals: {
            some: {
              goal: { id: goalId },
            },
          },
        });
      }
    }

    const [meditations, total] = await Promise.all([
      this.prisma.meditation.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          format: true,
          durationSec: true,
          instructor: true,
          type: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          // Include minimal relation data for list view
          categories: {
            select: {
              id: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          moods: {
            select: {
              id: true,
              mood: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          goals: {
            select: {
              id: true,
              goal: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.meditation.count({ where }),
    ]);

    return { meditations, total };
  }

  async getMeditationResourceById(id: string, schoolId?: string) {
    return this.prisma.meditation.findUnique({
      where: { 
        id,
        deletedAt: null, // Exclude soft-deleted records
        ...(schoolId && { schoolId }),
      },
      include: {
        moods: {
          include: {
            mood: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        goals: {
          include: {
            goal: true,
          },
        },
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateMeditationResource(id: string, data: UpdateMeditationResourceInput & { schoolId?: string }) {
    const { categoryIds, moodIds, goalIds, schoolId, ...updateData } = data;

    return this.prisma.$transaction(async (tx) => {
      // Update the basic meditation data
      const meditation = await tx.meditation.update({
        where: { id },
        data: {
          ...updateData,
          ...(schoolId && { schoolId }),
          // Update relations in the same transaction
          ...(moodIds !== undefined && {
            moods: {
              deleteMany: {},
              ...(moodIds.length > 0 && {
                create: moodIds.map((moodId: string) => ({
                  mood: { connect: { id: moodId } }
                }))
              })
            }
          }),
          ...(categoryIds !== undefined && {
            categories: {
              deleteMany: {},
              ...(categoryIds.length > 0 && {
                create: categoryIds.map((categoryId: string) => ({
                  category: { connect: { id: categoryId } }
                }))
              })
            }
          }),
          ...(goalIds !== undefined && {
            goals: {
              deleteMany: {},
              ...(goalIds.length > 0 && {
                create: goalIds.map((goalId: string) => ({
                  goal: { connect: { id: goalId } }
                }))
              })
            }
          })
        },
        include: {
          moods: {
            include: {
              mood: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          goals: {
            include: {
              goal: true,
            },
          },
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return meditation;
    });
  }

  async deleteMeditationResource(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Soft delete by setting deletedAt timestamp
      const meditation = await tx.meditation.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: "ARCHIVED"
        }
      });

      return meditation;
    });
  }

  // ====================================
  //        MEDITATION CATEGORY OPERATIONS
  // ====================================

  async createMeditationCategory(data: CreateMeditationCategoryInput) {
    return this.prisma.meditationCategory.create({
      data,
    });
  }

  async getMeditationCategories(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) {
    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.meditationCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.meditationCategory.count({ where }),
    ]);

    return { categories, total };
  }

  async getMeditationCategoryById(id: string) {
    return this.prisma.meditationCategory.findUnique({
      where: { id },
    });
  }

  async updateMeditationCategory(id: string, data: UpdateMeditationCategoryInput) {
    return this.prisma.meditationCategory.update({
      where: { id },
      data,
    });
  }

  async deleteMeditationCategory(id: string) {
    return this.prisma.meditationCategory.delete({
      where: { id },
    });
  }

  // ====================================
  //           MEDITATION GOAL OPERATIONS
  // ====================================

  async createMeditationGoal(data: CreateMeditationGoalInput) {
    return this.prisma.meditationGoal.create({
      data,
    });
  }

  async getMeditationGoals(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) {
    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [goals, total] = await Promise.all([
      this.prisma.meditationGoal.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.meditationGoal.count({ where }),
    ]);

    return { goals, total };
  }

  async getMeditationGoalById(id: string) {
    return this.prisma.meditationGoal.findUnique({
      where: { id },
    });
  }

  async updateMeditationGoal(id: string, data: UpdateMeditationGoalInput) {
    return this.prisma.meditationGoal.update({
      where: { id },
      data,
    });
  }

  async deleteMeditationGoal(id: string) {
    return this.prisma.meditationGoal.delete({
      where: { id },
    });
  }

  // ====================================
  //     MEDITATION INSTRUCTION OPERATIONS
  // ====================================

  async createMeditationInstruction(data: CreateMeditationInstructionInput & { schoolId?: string; createdBy?: string }) {
    return this.prisma.meditationListeningInstruction.create({
      data: {
        title: data.title,
        description: data.description,
        steps: data.steps,
        duration: data.duration,
        difficulty: data.difficulty,
        status: data.status,
        resourceId: data.resourceId,
        ...(data.schoolId && { schoolId: data.schoolId }),
        ...(data.createdBy && { createdBy: data.createdBy }),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getMeditationInstructions(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    difficulty?: string;
    schoolId?: string;
  }) {
    const { page, limit, search, status, difficulty, schoolId } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(schoolId && { schoolId }),
      ...(status && { status }),
      ...(difficulty && { difficulty }),
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [instructions, total] = await Promise.all([
      this.prisma.meditationListeningInstruction.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          school: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.meditationListeningInstruction.count({ where }),
    ]);

    return { instructions, total };
  }

  async getMeditationInstructionById(id: string) {
    return this.prisma.meditationListeningInstruction.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateMeditationInstruction(id: string, data: UpdateMeditationInstructionInput) {
    return this.prisma.meditationListeningInstruction.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteMeditationInstruction(id: string) {
    return this.prisma.meditationListeningInstruction.delete({
      where: { id },
    });
  }

  async getInstructionsByResource(resourceId: string) {
    return this.prisma.meditationListeningInstruction.findMany({
      where: { resourceId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
