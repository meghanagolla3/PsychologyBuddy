import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

// Log environment variables for debugging
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

export async function GET(request: NextRequest) {
  try {
    console.log("Categories API called");
    const { searchParams } = new URL(request.url);
    const tool = searchParams.get('tool');
    console.log("Tool parameter:", tool);

    if (!tool) {
      console.log("No tool parameter provided");
      return NextResponse.json(
        { error: 'Tool parameter is required' },
        { status: 400 }
      );
    }

    // Map tool names to database fields
    const toolMapping = {
      meditation: 'requiresMeditation',
      music: 'requiresMusic',
      psychoeducation: 'requiresPsychoeducation',
    };

    const toolField = toolMapping[tool as keyof typeof toolMapping];
    
    if (!toolField) {
      return NextResponse.json(
        { error: 'Invalid tool specified' },
        { status: 400 }
      );
    }

    // Fetch categories from dedicated category tables
    let categories: any[];
    try {
      console.log(`Fetching categories for tool: ${tool}`);
      
      switch (tool) {
        case 'meditation':
          categories = await prisma.meditationCategory.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
          });
          break;
          
        case 'music':
          categories = await prisma.musicCategory.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
          });
          break;
          
        case 'psychoeducation':
          categories = await prisma.categoryLabel.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
          });
          break;
          
        default:
          categories = [];
      }
      
      console.log(`Query result: ${JSON.stringify(categories, null, 2)}`);
      console.log(`Number of categories found: ${categories?.length || 0}`);
    } catch (dbError) {
      
      categories = []; // Fallback to empty array
    }

    // Format response - categories already have correct structure from database
    let formattedCategories = (categories || []).map((c, index) => ({
      id: c.id,
      name: c.name,
      order: index
    }));

    // If no categories found, provide default categories
    if (formattedCategories.length === 0) {
      const defaultCategories = {
        meditation: [
          { id: 'mindfulness', name: 'Mindfulness', order: 0 },
          { id: 'breathing', name: 'Breathing', order: 1 },
          { id: 'guided', name: 'Guided Meditation', order: 2 }
        ],
        music: [
          { id: 'relaxation', name: 'Relaxation', order: 0 },
          { id: 'focus', name: 'Focus', order: 1 },
          { id: 'sleep', name: 'Sleep', order: 2 }
        ],
        psychoeducation: [
          { id: 'anxiety', name: 'Anxiety Management', order: 0 },
          { id: 'stress', name: 'Stress Relief', order: 1 },
          { id: 'self-esteem', name: 'Self-Esteem', order: 2 }
        ]
      };
      
      const items = defaultCategories[tool as keyof typeof defaultCategories] || [];
      formattedCategories = items.map((item, index) => ({
        id: item.id,
        name: item.name,
        order: index
      }));
    }

    console.log("Returning categories:", formattedCategories);
    const response = NextResponse.json({
      success: true,
      data: formattedCategories
    });
    console.log("API response created");
    return response;

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

