import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// GET - Get available tools for challenges
export const GET = withPermission({
  module: 'ADMIN',
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
        duration: true,
        description: true,
      },
      orderBy: { title: 'asc' },
    });

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
        summary: true,
        estimatedReadTime: true,
      },
      orderBy: { title: 'asc' },
    });

    // Get journaling configuration
    const journalingConfig = await prisma.journalingToolConfig.findUnique({
      where: { schoolId },
      select: {
        id: true,
        writingEnabled: true,
        audioEnabled: true,
        artEnabled: true,
        writingPrompts: true,
        audioPrompts: true,
        artPrompts: true,
      },
    });

    const tools = {
      meditation: meditationResources,
      music: musicResources,
      psychoeducation: psychoeducationResources,
      journaling: {
        available: !!journalingConfig,
        config: journalingConfig ? {
          writingEnabled: journalingConfig.writingEnabled,
          audioEnabled: journalingConfig.audioEnabled,
          artEnabled: journalingConfig.artEnabled,
          types: []
        } : null
      }
    };

    // Add journaling types if enabled
    if (journalingConfig) {
      const journalTypes = [];
      if (journalingConfig.writingEnabled) {
        journalTypes.push({
          type: 'writing',
          name: 'Writing Journal',
          prompts: journalingConfig.writingPrompts || []
        });
      }
      if (journalingConfig.audioEnabled) {
        journalTypes.push({
          type: 'audio',
          name: 'Audio Journal',
          prompts: journalingConfig.audioPrompts || []
        });
      }
      if (journalingConfig.artEnabled) {
        journalTypes.push({
          type: 'art',
          name: 'Art Journal',
          prompts: journalingConfig.artPrompts || []
        });
      }
      tools.journaling.config.types = journalTypes;
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
