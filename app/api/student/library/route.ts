import { NextRequest, NextResponse } from 'next/server';
import { LibraryService } from '@/src/components/server/content/library/library.service';
import { getSession } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';

// GET /api/student/library - Get all published articles for students
export async function GET(req: NextRequest) {
  try {
    // Basic session validation - just check if user is logged in
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get all articles and filter for published ones only
    const result = await LibraryService.getAllArticles();
    
    // Filter only published articles for students
    const publishedArticles = result.data.filter((article: any) => article.status === 'PUBLISHED');
    
    return NextResponse.json({
      success: true,
      message: 'Published articles retrieved successfully',
      data: publishedArticles
    });
  } catch (error) {
    console.error('Get student articles error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
