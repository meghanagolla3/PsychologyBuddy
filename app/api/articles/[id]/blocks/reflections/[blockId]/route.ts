import { NextRequest, NextResponse } from 'next/server';
import { ReflectionBlockService } from '@/src/components/server/content/library/reflection-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// PUT /api/articles/[id]/blocks/reflections/[blockId] - Update reflection block (Admin & SuperAdmin)
export const PUT = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'UPDATE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { blockId } = await params;
    const body = await req.json();
    const result = await ReflectionBlockService.updateReflectionBlock(blockId, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Update reflection block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// DELETE /api/articles/[id]/blocks/reflections/[blockId] - Delete reflection block (Admin & SuperAdmin)
export const DELETE = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'DELETE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { blockId } = await params;
    const result = await ReflectionBlockService.deleteReflectionBlock(blockId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete reflection block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
