import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    console.log('🔍 Save check API called:', { id, studentId });

    // Check if article is saved
    const savedArticle = await prisma.savedArticle.findFirst({
      where: {
        articleId: id,
        studentId: studentId || null
      }
    });

    console.log('📊 Save check database result:', { 
      savedArticle: !!savedArticle, 
      articleId: id, 
      studentId: studentId || null,
      foundSaveId: savedArticle?.id 
    });

    return NextResponse.json({
      success: true,
      isSaved: !!savedArticle
    });

  } catch (error) {
    console.error('Error checking saved status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check saved status' },
      { status: 500 }
    );
  }
}
