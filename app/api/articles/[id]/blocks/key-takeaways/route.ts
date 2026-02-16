import { NextRequest, NextResponse } from 'next/server';
import { KeyTakeawaysBlockService } from '@/src/components/server/content/library/key-takeaways-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// GET /api/articles/[id]/blocks/key-takeaways - Get key takeaways blocks (Admin & SuperAdmin)
export const GET = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'VIEW'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = await params;
    const result = await KeyTakeawaysBlockService.getKeyTakeawaysBlocks(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get key takeaways blocks error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// POST /api/articles/[id]/blocks/key-takeaways - Add key takeaways block (Admin & SuperAdmin)
export const POST = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'CREATE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await KeyTakeawaysBlockService.createKeyTakeawaysBlock(id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Create key takeaways block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
