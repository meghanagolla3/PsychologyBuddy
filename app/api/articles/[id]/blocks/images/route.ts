import { NextRequest, NextResponse } from 'next/server';
import { ImageBlockService } from '@/src/server/content/library/image-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// GET /api/articles/[id]/blocks/images - Get image blocks (Admin & SuperAdmin)
export const GET = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'VIEW'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = await params;
    const result = await ImageBlockService.getImageBlocks(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get image blocks error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// POST /api/articles/[id]/blocks/images - Add image block (Admin & SuperAdmin)
export const POST = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'CREATE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await ImageBlockService.createImageBlock(id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Create image block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
