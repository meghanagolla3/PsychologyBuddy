import prisma from '@/src/prisma';

export class MusicInstructionsRepository {
  // Music Listening Instructions Management
  static async createInstruction(data: {
    title: string;
    description: string;
    steps: any[];
    duration?: number;
    difficulty?: string;
    status?: string;
    resourceId?: string;
    createdBy?: string | null;
    schoolId?: string | null;
  }) {
    return await prisma.musicListeningInstruction.create({
      data: {
        title: data.title,
        description: data.description,
        steps: data.steps,
        duration: data.duration,
        difficulty: data.difficulty,
        status: data.status,
        createdBy: data.createdBy,
        schoolId: data.schoolId,
        resourceId: data.resourceId,
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
        school: true,
        resource: true,
      },
    });
  }

  static async getInstruction(id: string) {
    return await prisma.musicListeningInstruction.findUnique({
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
        school: true,
        resource: true,
      },
    });
  }

  static async getInstructions(filters: {
    difficulty?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { difficulty, status = 'PUBLISHED', page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { status };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const [instructions, total] = await Promise.all([
      prisma.musicListeningInstruction.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          school: true,
          resource: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.musicListeningInstruction.count({ where }),
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

  static async updateInstruction(id: string, data: Partial<{
    title?: string;
    description?: string;
    steps?: any[];
    duration?: number;
    difficulty?: string;
    status?: string;
    resourceId?: string;
  }>) {
    return await prisma.musicListeningInstruction.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        steps: data.steps,
        duration: data.duration,
        difficulty: data.difficulty,
        status: data.status,
        resourceId: data.resourceId,
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
        school: true,
        resource: true,
      },
    });
  }

  static async deleteInstruction(id: string) {
    return await prisma.musicListeningInstruction.delete({
      where: { id },
    });
  }

  // Get instructions by resource
  static async getInstructionsByResource(resourceId: string) {
    return await prisma.musicListeningInstruction.findMany({
      where: { 
        resourceId,
        status: 'PUBLISHED'
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
        school: true,
        resource: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
