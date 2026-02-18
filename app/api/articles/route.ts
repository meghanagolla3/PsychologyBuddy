import { NextRequest, NextResponse } from 'next/server';
import { LibraryService } from '@/src/server/content/library/library.service';
import { getSession } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { CreateArticleSchema } from '@/src/server/content/library/library.validators';

// GET /api/articles - Get all articles (Admin & SuperAdmin)
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
    
    // For now, allow any authenticated user to view articles
    // TODO: Add proper role-based filtering if needed
    const result = await LibraryService.getAllArticles();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get articles error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}

// POST /api/articles - Create article (Admin & SuperAdmin)
export async function POST(req: NextRequest) {
  try {
    // Basic session validation - just check if user is logged in
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate the request body
    const validatedData = CreateArticleSchema.parse(body);
    
    // TODO: Add role check for admin/superadmin if needed
    const result = await LibraryService.createArticle(validatedData, session.userId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Create article error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
