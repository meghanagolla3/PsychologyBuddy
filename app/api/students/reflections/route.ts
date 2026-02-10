import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Fetch summaries for the student using the new Summary model
    const summaries = await prisma.summary.findMany({
      where: {
        studentId: studentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to last 20 summaries
    });

    // Transform summaries to reflection format
    const reflections = summaries.map(summary => ({
      id: summary.id,
      title: summary.mainTopic,
      content: summary.reflection,
      mood: 'Neutral', // Default mood since new model doesn't have mood field
      createdAt: summary.createdAt.toISOString(),
      topics: [summary.mainTopic], // Use mainTopic as the primary topic
      messageCount: 0, // Not tracked in new model
      sessionId: summary.sessionId,
    }));

    return NextResponse.json({
      success: true,
      data: reflections,
    });

  } catch (error) {
    console.error('Error fetching reflections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reflections' },
      { status: 500 }
    );
  }
}
