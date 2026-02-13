import prisma from '@/src/prisma';

export class MeditationRepository {
  // Meditation Resources Management
  static async createMeditation(data: {
    title: string;
    description: string;
    thumbnailUrl?: string;
    format: string;
    audioUrl?: string;
    videoUrl?: string;
    durationSec?: number;
    instructor?: string;
    type?: string;
    categoryIds?: string[];
    goalIds?: string[];
    status?: string;
    schoolId?: string;
    createdBy: string;
  }) {
    return await prisma.meditation.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        format: data.format as any,
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl,
        durationSec: data.durationSec,
        instructor: data.instructor,
        type: data.type,
        status: data.status as any,
        schoolId: data.schoolId,
        createdBy: data.createdBy,
        categories: data.categoryIds ? {
          create: data.categoryIds.map(categoryId => ({
            categoryId,
          })),
        } : undefined,
        goals: data.goalIds ? {
          create: data.goalIds.map(goalId => ({
            goalId,
          })),
        } : undefined,
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        moods: true,
        goals: {
          include: {
            goal: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  static async getMeditations(params: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    status?: string;
    categoryId?: string;
    goalId?: string;
    schoolId?: string;
  }) {
    const where: any = {};

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { instructor: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.categoryId) {
      where.categories = {
        some: {
          categoryId: params.categoryId,
        },
      };
    }

    if (params.goalId) {
      where.goals = {
        some: {
          goalId: params.goalId,
        },
      };
    }

    if (params.schoolId) {
      where.schoolId = params.schoolId;
    }

    const skip = (params.page - 1) * params.limit;

    const [meditations, total] = await Promise.all([
      prisma.meditation.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          moods: true,
          goals: {
            include: {
              goal: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
      prisma.meditation.count({ where }),
    ]);

    return {
      meditations,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  static async getMeditationById(id: string) {
    return await prisma.meditation.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        moods: true,
        goals: true,
        categories: true,
      },
    });
  }

  static async updateMeditation(id: string, data: Partial<{
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    format?: string;
    audioUrl?: string;
    videoUrl?: string;
    durationSec?: number;
    instructor?: string;
    type?: string;
    category?: string;
    goal?: string;
    status?: string;
  }>) {
    return await prisma.meditation.update({
      where: { id },
      data: {
        ...data,
        format: data.format as any,
        status: data.status as any,
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        moods: true,
        goals: true,
        categories: true,
      },
    });
  }

  static async deleteMeditation(id: string) {
    return await prisma.meditation.delete({
      where: { id },
    });
  }

  static async getMeditationsByType(type: string, params: { page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit;

    const [meditations, total] = await Promise.all([
      prisma.meditation.findMany({
        where: { category: type, status: 'PUBLISHED' }, // Use category as type for now
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          moods: true,
          goals: true,
          categories: true,
        },
      }),
      prisma.meditation.count({ where: { category: type, status: 'PUBLISHED' } }),
    ]);

    return {
      meditations,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  static async getMeditationsByCategory(category: string, params: { page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit;

    const [meditations, total] = await Promise.all([
      prisma.meditation.findMany({
        where: { category, status: 'PUBLISHED' },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          moods: true,
          goals: true,
          categories: true,
        },
      }),
      prisma.meditation.count({ where: { category, status: 'PUBLISHED' } }),
    ]);

    return {
      meditations,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  static async getMeditationsByGoal(goal: string, params: { page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit;

    const [meditations, total] = await Promise.all([
      prisma.meditation.findMany({
        where: { goal, status: 'PUBLISHED' },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          moods: true,
          goals: true,
          categories: true,
        },
      }),
      prisma.meditation.count({ where: { goal, status: 'PUBLISHED' } }),
    ]);

    return {
      meditations,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
