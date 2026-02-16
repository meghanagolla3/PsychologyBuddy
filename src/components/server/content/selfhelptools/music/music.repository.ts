import { PrismaClient } from '@/src/generated/prisma/client';
import {
  CreateMusicResourceInput,
  UpdateMusicResourceInput,
  CreateMusicCategoryInput,
  UpdateMusicCategoryInput,
  CreateMusicGoalInput,
  UpdateMusicGoalInput,
  CreateMusicInstructionInput,
  UpdateMusicInstructionInput,
} from "./music.validators";

export class MusicRepository {
  constructor(private prisma: PrismaClient) {}

  // ====================================
  //        MUSIC RESOURCE OPERATIONS
  // ====================================

  async createMusicResource(data: CreateMusicResourceInput & { schoolId?: string }) {
    const { categoryIds, goalIds, schoolId, ...resourceData } = data;

    // Only include schoolId if it's a valid UUID (not placeholder)
    const createData: any = {
      ...resourceData,
      categories: categoryIds ? {
        create: categoryIds.map(categoryId => ({
          categoryId,
        })),
      } : undefined,
      goals: goalIds ? {
        create: goalIds.map(goalId => ({
          goalId,
        })),
      } : undefined,
    };

    // Only add schoolId if it's provided and not a placeholder
    if (schoolId && schoolId !== "school_id") {
      createData.schoolId = schoolId;
    }

    const resource = await this.prisma.musicResource.create({
      data: createData,
      include: {
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
        school: true,
      },
    });

    return resource;
  }

  async getMusicResources(filters: {
    category?: string;
    goal?: string;
    status?: string;
    page: number;
    limit: number;
    schoolId?: string;
  }) {
    const { category, goal, status, page, limit, schoolId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
    };

    // Only add schoolId filter if it's provided and not a placeholder
    if (schoolId && schoolId !== "school_id") {
      where.schoolId = schoolId;
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            name: {
              contains: category,
              mode: "insensitive" as const,
            },
          },
        },
      };
    }

    if (goal) {
      where.goals = {
        some: {
          goal: {
            name: {
              contains: goal,
              mode: "insensitive" as const,
            },
          },
        },
      };
    }

    const [resources, total] = await Promise.all([
      this.prisma.musicResource.findMany({
        where,
        include: {
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
          school: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.musicResource.count({ where }),
    ]);

    return {
      resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMusicResourceById(id: string) {
    return await this.prisma.musicResource.findUnique({
      where: { id },
      include: {
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
        school: true,
      },
    });
  }

  async updateMusicResource(id: string, data: UpdateMusicResourceInput & { schoolId?: string }) {
    const { categoryIds, goalIds, ...updateData } = data;

    // Handle category updates
    if (categoryIds !== undefined) {
      await this.prisma.MusicResourceCategory.deleteMany({
        where: { musicResourceId: id },
      });
    }

    // Handle goal updates
    if (goalIds !== undefined) {
      await this.prisma.musicResourceGoal.deleteMany({
        where: { musicResourceId: id },
      });
    }

    return await this.prisma.musicResource.update({
      where: { id },
      data: {
        ...updateData,
        categories: categoryIds ? {
          create: categoryIds.map(categoryId => ({
            categoryId,
          })),
        } : undefined,
        goals: goalIds ? {
          create: goalIds.map(goalId => ({
            goalId,
          })),
        } : undefined,
      },
      include: {
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
        school: true,
      },
    });
  }

  async deleteMusicResource(id: string) {
    return await this.prisma.musicResource.delete({
      where: { id },
    });
  }

  // ====================================
  //        MUSIC CATEGORY OPERATIONS
  // ====================================

  async createMusicCategory(data: CreateMusicCategoryInput) {
    return await this.prisma.musicCategory.create({
      data,
    });
  }

  async getMusicCategories(filters: { status?: string } = {}) {
    const { status } = filters;

    return await this.prisma.musicCategory.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async getMusicCategoryById(id: string) {
    return await this.prisma.musicCategory.findUnique({
      where: { id },
      include: {
        musicResources: {
          include: {
            musicResource: true,
          },
        },
      },
    });
  }

  async updateMusicCategory(id: string, data: UpdateMusicCategoryInput) {
    return await this.prisma.musicCategory.update({
      where: { id },
      data,
    });
  }

  async deleteMusicCategory(id: string) {
    return await this.prisma.musicCategory.delete({
      where: { id },
    });
  }

  // ====================================
  //           MUSIC GOAL OPERATIONS
  // ====================================

  async createMusicGoal(data: CreateMusicGoalInput) {
    return await this.prisma.musicGoal.create({
      data,
    });
  }

  async getMusicGoals(filters: { status?: string } = {}) {
    const { status } = filters;

    return await this.prisma.musicGoal.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async getMusicGoalById(id: string) {
    return await this.prisma.musicGoal.findUnique({
      where: { id },
      include: {
        musicResources: {
          include: {
            musicResource: true,
          },
        },
      },
    });
  }

  async updateMusicGoal(id: string, data: UpdateMusicGoalInput) {
    return await this.prisma.musicGoal.update({
      where: { id },
      data,
    });
  }

  async deleteMusicGoal(id: string) {
    return await this.prisma.musicGoal.delete({
      where: { id },
    });
  }

  // ====================================
  //      MUSIC INSTRUCTION OPERATIONS
  // ====================================

  async createMusicInstruction(data: CreateMusicInstructionInput & { schoolId?: string }) {
    return await this.prisma.meditationListeningInstruction.create({
      data,
      include: {
        creator: true,
        school: true,
      },
    });
  }

  async getMusicInstructions(filters: {
    difficulty?: string;
    status?: string;
    page: number;
    limit: number;
    schoolId?: string;
  }) {
    const { difficulty, status, page, limit, schoolId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(schoolId && { schoolId }),
      ...(status && { status }),
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const [instructions, total] = await Promise.all([
      this.prisma.meditationListeningInstruction.findMany({
        where,
        include: {
          creator: true,
          school: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.meditationListeningInstruction.count({ where }),
    ]);

    return {
      instructions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMusicInstructionById(id: string) {
    return await this.prisma.meditationListeningInstruction.findUnique({
      where: { id },
      include: {
        creator: true,
        school: true,
      },
    });
  }

  async updateMusicInstruction(id: string, data: UpdateMusicInstructionInput) {
    return await this.prisma.meditationListeningInstruction.update({
      where: { id },
      data,
      include: {
        creator: true,
        school: true,
      },
    });
  }

  async deleteMusicInstruction(id: string) {
    return await this.prisma.meditationListeningInstruction.delete({
      where: { id },
    });
  }

  async getInstructionsByResource(resourceId: string, filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { status = "PUBLISHED", page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      resourceId,
      status,
    };

    const [instructions, total] = await Promise.all([
      this.prisma.meditationListeningInstruction.findMany({
        where,
        include: {
          creator: true,
          school: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.meditationListeningInstruction.count({ where }),
    ]);

    return {
      instructions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ====================================
  //           STUDENT ACCESS METHODS
  // ====================================

  async getPublishedMusicResources(filters: {
    category?: string;
    goal?: string;
    page: number;
    limit: number;
    schoolId?: string;
  }) {
    return this.getMusicResources({
      ...filters,
      status: "PUBLISHED",
    });
  }

  async getPublishedMusicResourceById(id: string) {
    return await this.prisma.musicResource.findFirst({
      where: {
        id,
        status: "PUBLISHED",
      },
      include: {
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
        school: true,
      },
    });
  }

  async getFeaturedMusic(limit: number = 10, schoolId?: string) {
    return await this.prisma.musicResource.findMany({
      where: {
        status: "PUBLISHED",
        ...(schoolId && { schoolId }),
        isPublic: true,
      },
      include: {
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
        school: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  async getPublishedMusicInstructions(filters: {
    difficulty?: string;
    page: number;
    limit: number;
    schoolId?: string;
  }) {
    return this.getMusicInstructions({
      ...filters,
      status: "PUBLISHED",
    });
  }

  async getPublishedMusicInstructionById(id: string) {
    return await this.prisma.meditationListeningInstruction.findFirst({
      where: {
        id,
        status: "PUBLISHED",
      },
      include: {
        creator: true,
        school: true,
      },
    });
  }

  async getPublishedInstructionsByResource(resourceId: string, filters: {
    page?: number;
    limit?: number;
  } = {}) {
    return this.getInstructionsByResource(resourceId, {
      ...filters,
      status: "PUBLISHED",
    });
  }
}
