import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { studentId } = await request.json();

    console.log('💾 Save API called:', { id, studentId });

    // Get current article
    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if article is already saved
    const existingSave = await prisma.savedArticle.findFirst({
      where: {
        articleId: id,
        studentId: studentId || null
      }
    });

    console.log('🔍 Existing save check result:', { 
      existingSave: !!existingSave, 
      articleId: id, 
      studentId: studentId || null,
      existingSaveId: existingSave?.id 
    });

    if (existingSave) {
      console.log('⚠️ Article already saved, returning 409');
      return NextResponse.json(
        { success: false, message: 'Article already saved' },
        { status: 409 }
      );
    }

    // Create new saved article
    console.log('💾 Creating new saved article...');
    const newSave = await prisma.savedArticle.create({
      data: {
        articleId: id,
        studentId: studentId || null
      }
    });

    console.log('✅ Article saved to database:', { 
      saveId: newSave.id, 
      articleId: id, 
      studentId: studentId || null 
    });

    return NextResponse.json({
      success: true,
      message: 'Article saved successfully'
    });

  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save article' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { studentId } = await request.json();

    console.log('🗑️ Delete save API called:', { id, studentId });

    // Find and delete the saved article
    const existingSave = await prisma.savedArticle.findFirst({
      where: {
        articleId: id,
        studentId: studentId || null
      }
    });

    console.log('🔍 Existing save for delete:', { existingSave: !!existingSave });

    if (existingSave) {
      await prisma.savedArticle.delete({
        where: { id: existingSave.id }
      });

      console.log('✅ Article unsaved:', { saveId: existingSave.id, articleId: id, studentId: studentId || null });

      return NextResponse.json({
        success: true,
        message: 'Article unsaved successfully'
      });
    } else {
      console.log('❌ No saved article found to delete');
      return NextResponse.json(
        { success: false, message: 'No saved article found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error unsaving article:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to unsave article' },
      { status: 500 }
    );
  }
}
