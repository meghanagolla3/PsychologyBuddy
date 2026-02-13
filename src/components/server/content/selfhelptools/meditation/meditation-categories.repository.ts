import prisma from '@/src/prisma';

export class MeditationCategoriesRepository {
  static async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    status?: string;
  }) {
    return await prisma.meditationCategory.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        status: data.status || 'ACTIVE',
      },
    });
  }

  static async getCategories(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) {
    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    const skip = (params.page - 1) * params.limit;

    const [categories, total] = await Promise.all([
      prisma.meditationCategory.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.meditationCategory.count({ where }),
    ]);

    return {
      categories,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  static async getCategoryById(id: string) {
    return await prisma.meditationCategory.findUnique({
      where: { id },
    });
  }

  static async updateCategory(id: string, data: Partial<{
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    status?: string;
  }>) {
    return await prisma.meditationCategory.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: string) {
    return await prisma.meditationCategory.delete({
      where: { id },
    });
  }

  static async getStudentCategories(params: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const where: any = {
      status: 'ACTIVE',
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [categories, total] = await Promise.all([
      prisma.meditationCategory.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { name: 'asc' },
      }),
      prisma.meditationCategory.count({ where }),
    ]);

    return {
      categories,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  static async getStudentCategoryById(id: string) {
    return await prisma.meditationCategory.findUnique({
      where: { id, status: 'ACTIVE' },
    });
  }
}
