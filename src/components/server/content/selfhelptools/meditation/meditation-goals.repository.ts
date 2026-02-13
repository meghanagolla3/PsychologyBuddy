import prisma from '@/src/prisma';

export class MeditationGoalsRepository {
  static async createGoal(data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }) {
    return await prisma.meditationGoal.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
      },
    });
  }

  static async getGoals(params: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [goals, total] = await Promise.all([
      prisma.meditationGoal.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.meditationGoal.count({ where }),
    ]);

    return {
      goals,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  static async getGoalById(id: string) {
    return await prisma.meditationGoal.findUnique({
      where: { id },
    });
  }

  static async updateGoal(id: string, data: Partial<{
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
  }>) {
    return await prisma.meditationGoal.update({
      where: { id },
      data,
    });
  }

  static async deleteGoal(id: string) {
    return await prisma.meditationGoal.delete({
      where: { id },
    });
  }

  static async getStudentGoals(params: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [goals, total] = await Promise.all([
      prisma.meditationGoal.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { name: 'asc' },
      }),
      prisma.meditationGoal.count({ where }),
    ]);

    return {
      goals,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  static async getStudentGoalById(id: string) {
    return await prisma.meditationGoal.findUnique({
      where: { id },
    });
  }
}
