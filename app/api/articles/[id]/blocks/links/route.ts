import { NextRequest, NextResponse } from 'next/server';
import { LinkBlockService } from '@/src/server/content/library/link-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// GET /api/articles/[id]/blocks/links - Get link blocks (Admin & SuperAdmin)
export const GET = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'VIEW'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = await params;
    const result = await LinkBlockService.getLinkBlocks(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get link blocks error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// POST /api/articles/[id]/blocks/links - Add link block (Admin & SuperAdmin)
export const POST = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'CREATE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await LinkBlockService.createLinkBlock(id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Create link block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// PUT /api/articles/[id]/blocks/links/[blockId] - Update link block (Admin & SuperAdmin)
export const PUT = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'UPDATE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { blockId } = await params;
    const body = await req.json();
    const result = await LinkBlockService.updateLinkBlock(blockId, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Update link block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// DELETE /api/articles/[id]/blocks/links/[blockId] - Delete link block (Admin & SuperAdmin)
export const DELETE = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'DELETE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { blockId } = await params;
    const result = await LinkBlockService.deleteLinkBlock(blockId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete link block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
