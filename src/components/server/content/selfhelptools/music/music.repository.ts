import prisma from '@/src/prisma';

export class MusicRepository {
  // Music Resources (MusicResource - new dedicated model)
  static async createMusicResource(data: {
    title: string;
    description?: string;
    url: string;
    duration?: number;
    artist?: string;
    album?: string;
    coverImage?: string;
    isPublic?: boolean;
    schoolId?: string;
    status?: string;
    categoryIds?: string[];
    goalIds?: string[];
  }) {
    const { categoryIds = [], goalIds = [], ...resourceData } = data;
    
    return await prisma.musicResource.create({
      data: {
        ...resourceData,
        categories: categoryIds.length > 0 ? {
          create: categoryIds.map(categoryId => ({
            categoryId,
          }))
        } : undefined,
        goals: goalIds.length > 0 ? {
          create: goalIds.map(goalId => ({
            goalId,
          }))
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

  static async getMusicResource(id: string) {
    return await prisma.musicResource.findUnique({
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

  static async getMusicResources(filters: {
    category?: string;
    goal?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, goal, status = 'PUBLISHED', page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { status };

    if (category) {
      where.categories = {
        some: {
          category: {
            name: {
              contains: category,
              mode: 'insensitive',
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
              mode: 'insensitive',
            },
          },
        },
      };
    }

    const [resources, total] = await Promise.all([
      prisma.musicResource.findMany({
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.musicResource.count({ where }),
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

  static async updateMusicResource(id: string, data: Partial<{
    title: string;
    description?: string;
    url: string;
    duration?: number;
    artist?: string;
    album?: string;
    coverImage?: string;
    isPublic?: boolean;
    status?: string;
    categoryIds?: string[];
    goalIds?: string[];
  }>) {
    const { categoryIds, goalIds, ...updateData } = data;
    
    return await prisma.musicResource.update({
      where: { id },
      data: {
        ...updateData,
        categories: categoryIds ? {
          deleteMany: {},
          create: categoryIds.map(categoryId => ({
            categoryId,
          }))
        } : undefined,
        goals: goalIds ? {
          deleteMany: {},
          create: goalIds.map(goalId => ({
            goalId,
          }))
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

  static async deleteMusicResource(id: string) {
    return await prisma.musicResource.delete({
      where: { id },
    });
  }

  // Categories (MusicCategory - new dedicated model)
  static async createCategory(name: string, status: string = 'ACTIVE') {
    return await prisma.musicCategory.create({
      data: { name, status },
    });
  }

  static async getCategories() {
    return await prisma.musicCategory.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });
  }

  static async updateCategory(id: string, data: { name?: string; status?: string }) {
    return await prisma.musicCategory.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: string) {
    return await prisma.musicCategory.delete({
      where: { id },
    });
  }

  // Goals (MusicGoal - new dedicated model)
  static async createGoal(name: string) {
    return await prisma.musicGoal.create({
      data: { name },
    });
  }

  static async getGoals() {
    return await prisma.musicGoal.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });
  }

  static async updateGoal(id: string, data: { name?: string }) {
    return await prisma.musicGoal.update({
      where: { id },
      data,
    });
  }

  static async deleteGoal(id: string) {
    return await prisma.musicGoal.delete({
      where: { id },
    });
  }
}
