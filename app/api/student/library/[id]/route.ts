import { NextRequest, NextResponse } from 'next/server';
import { LibraryService } from '@/src/server/content/library/library.service';
import { getSession } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';

// GET /api/student/library/[id] - Get specific published article for students
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Basic session validation - just check if user is logged in
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    // Get the article
    const result = await LibraryService.getArticleById(id);
    
    // Check if article is published (students can only view published articles)
    if (result.data.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, message: 'Article not available' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Article retrieved successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Get student article error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
