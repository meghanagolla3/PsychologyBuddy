import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function POST() {
  try {
    // Get all unassigned meditations (created in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const unassignedMeditations = await prisma.meditation.findMany({
      where: {
        status: 'PUBLISHED',
        categories: {
          none: {} // No categories assigned
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to recent ones
    });

    // Get available categories
    const categories = await prisma.meditationCategory.findMany({
      where: { status: 'ACTIVE' }
    });

    if (unassignedMeditations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unassigned meditations found'
      });
    }

    // Assign categories to unassigned meditations
    const results = [];
    for (const meditation of unassignedMeditations) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      if (category) {
        // Check if relationship already exists
        const existing = await prisma.meditationMeditationCategory.findFirst({
          where: {
            meditationId: meditation.id,
            categoryId: category.id
          }
        });

        if (!existing) {
          const result = await prisma.meditationMeditationCategory.create({
            data: {
              meditationId: meditation.id,
              categoryId: category.id
            }
          });
          
          results.push({
            meditationId: meditation.id,
            meditationTitle: meditation.title,
            categoryName: category.name,
            relationshipId: result.id
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Assigned categories to ${results.length} meditations`,
      data: results
    });
  } catch (error) {
    console.error('Error auto-assigning categories:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to assign categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
