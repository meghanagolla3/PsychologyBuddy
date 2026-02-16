import { NextRequest, NextResponse } from 'next/server';
import { ReflectionBlockService } from '@/src/components/server/content/library/reflection-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// GET /api/articles/[id]/blocks/reflections - Get reflection blocks (Admin & SuperAdmin)
export const GET = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'VIEW'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = await params;
    const result = await ReflectionBlockService.getReflectionBlocks(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get reflection blocks error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// POST /api/articles/[id]/blocks/reflections - Add reflection block (Admin & SuperAdmin)
export const POST = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'CREATE'
})(async (req: NextRequest, { params }: any) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await ReflectionBlockService.createReflectionBlock(id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Create reflection block error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
