import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// GET - Get available tools for challenges
export const GET = withPermission({
  module: 'CHALLENGES',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    let schoolId = user.schoolId;

    // Super Admin can see all tools, others only their school's tools
    if (user.role.name === 'SUPER_ADMIN' || !schoolId) {
      // For Super Admin, get all tools from all schools or use first school
      const firstSchool = await prisma.school.findFirst({
        select: { id: true }
      });
      schoolId = firstSchool?.id;
    }

    if (!schoolId) {
      return NextResponse.json({
        success: true,
        data: {
          meditation: [],
          music: [],
          psychoeducation: [],
          journaling: []
        },
        message: 'No school found',
      });
    }

    // Get meditation resources
    const meditationResources = await prisma.meditation.findMany({
      where: { schoolId },
      select: {
        id: true,
        title: true,
        durationSec: true,
        description: true,
      },
      orderBy: { title: 'asc' },
    });

    // Map meditation resources to match the frontend expected structure
    const meditationData = meditationResources.map((m) => ({
      id: m.id,
      title: m.title,
      duration: m.durationSec,
      description: m.description,
    }));

    // Get music resources
    const musicResources = await prisma.musicResource.findMany({
      where: { schoolId },
      select: {
        id: true,
        title: true,
        artist: true,
        duration: true,
        description: true,
      },
      orderBy: { title: 'asc' },
    });

    // Get psychoeducation articles
    const psychoeducationResources = await prisma.article.findMany({
      where: { schoolId },
      select: {
        id: true,
        title: true,
        description: true,
        readTime: true,
      },
      orderBy: { title: 'asc' },
    });

    // Map psychoeducation articles to match the frontend expected structure
    const psychoeducationData = psychoeducationResources.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.description,
      estimatedReadTime: a.readTime,
    }));

    // Get journaling configuration
    const journalingConfig = await prisma.journalingToolConfig.findUnique({
      where: { schoolId },
      select: {
        id: true,
        enableWriting: true,
        enableAudio: true,
        enableArt: true,
      },
    });

    const tools = {
      meditation: meditationData,
      music: musicResources,
      psychoeducation: psychoeducationData,
      journaling: {
        available: !!journalingConfig,
        config: journalingConfig ? {
          writingEnabled: journalingConfig.enableWriting,
          audioEnabled: journalingConfig.enableAudio,
          artEnabled: journalingConfig.enableArt,
          types: [] as any[]
        } : null
      }
    };

    // Add journaling types if enabled
    if (journalingConfig) {
      const journalTypes = [];
      if (journalingConfig.enableWriting) {
        journalTypes.push({
          type: 'writing',
          name: 'Writing Journal',
          prompts: [] as string[]
        });
      }
      if (journalingConfig.enableAudio) {
        journalTypes.push({
          type: 'audio',
          name: 'Audio Journal',
          prompts: [] as string[]
        });
      }
      if (journalingConfig.enableArt) {
        journalTypes.push({
          type: 'art',
          name: 'Art Journal',
          prompts: [] as string[]
        });
      }
      if (tools.journaling.config) {
        tools.journaling.config.types = journalTypes;
      }
    }

    return NextResponse.json({
      success: true,
      data: tools,
      message: 'Tools retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch tools' },
      { status: 500 }
    );
  }
});

