import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID required' },
        { status: 400 }
      );
    }

    // Get saved articles with their details
    const savedArticles = await prisma.savedArticle.findMany({
      where: {
        OR: [
          { studentId: studentId },
          { studentId: null }
        ]
      },
      include: {
        article: {
          include: {
            categories: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match expected format
    const articles = savedArticles.map((saved: any) => ({
      ...saved.article,
      savedAt: saved.createdAt,
      isSaved: true
    }));

    return NextResponse.json({
      success: true,
      data: articles
    });

  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch saved articles' },
      { status: 500 }
    );
  }
}
