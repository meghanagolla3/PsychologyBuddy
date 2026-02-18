import { NextRequest, NextResponse } from 'next/server';
import { ImageBlockService } from '@/src/server/content/library/image-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// PUT /api/articles/[id]/blocks/images/[blockId] - Update image block (Admin & SuperAdmin)
export const PUT = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'UPDATE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { blockId } = await params;
    const body = await req.json();
    const result = await ImageBlockService.updateImageBlock(blockId, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Update image block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// DELETE /api/articles/[id]/blocks/images/[blockId] - Delete image block (Admin & SuperAdmin)
export const DELETE = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'DELETE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { blockId } = await params;
    const result = await ImageBlockService.deleteImageBlock(blockId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete image block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
