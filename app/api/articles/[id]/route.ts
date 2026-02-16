import { NextRequest, NextResponse } from 'next/server';
import { LibraryService } from '@/src/components/server/content/library/library.service';
import { getSession } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { UpdateArticleSchema } from '@/src/components/server/content/library/library.validators';

// GET /api/articles/[id] - Get article by ID (Admin & SuperAdmin)
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
    const result = await LibraryService.getArticleById(id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get article error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}

// PUT /api/articles/[id] - Update article (Admin & SuperAdmin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const body = await req.json();
    
    // Validate the request body
    const validatedData = UpdateArticleSchema.parse(body);
    
    const result = await LibraryService.updateArticle(id, validatedData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Update article error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}

// DELETE /api/articles/[id] - Delete article (Admin & SuperAdmin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const result = await LibraryService.deleteArticle(id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete article error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
