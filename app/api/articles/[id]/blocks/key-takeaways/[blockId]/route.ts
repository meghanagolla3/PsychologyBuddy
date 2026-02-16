import { NextRequest, NextResponse } from 'next/server';
import { KeyTakeawaysBlockService } from '@/src/components/server/content/library/key-takeaways-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// PUT /api/articles/[id]/blocks/key-takeaways/[blockId] - Update key takeaways block (Admin & SuperAdmin)
export const PUT = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'UPDATE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { blockId } = await params;
    const body = await req.json();
    const result = await KeyTakeawaysBlockService.updateKeyTakeawaysBlock(blockId, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Update key takeaways block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// DELETE /api/articles/[id]/blocks/key-takeaways/[blockId] - Delete key takeaways block (Admin & SuperAdmin)
export const DELETE = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'DELETE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { blockId } = await params;
    const result = await KeyTakeawaysBlockService.deleteKeyTakeawaysBlock(blockId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete key takeaways block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
