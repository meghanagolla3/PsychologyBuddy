import { NextRequest, NextResponse } from 'next/server';
import { ArticleBlockService } from './article-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

export class ArticleBlockController {
  // GET /api/articles/[id]/blocks - Get article blocks (Admin & SuperAdmin)
  static getBlocks = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const result = await ArticleBlockService.getBlocks(id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get blocks error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/articles/[id]/blocks - Add block (Admin & SuperAdmin)
  static addBlock = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'CREATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const result = await ArticleBlockService.addBlock(id, body);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Add block error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PATCH /api/articles/[id]/blocks - Update block order (Admin & SuperAdmin)
  static updateBlockOrder = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const result = await ArticleBlockService.updateBlockOrder(id, body.blocks);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update block order error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/articles/[id]/blocks/[blockId] - Update block (Admin & SuperAdmin)
  static updateBlock = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { blockId } = await params;
      const body = await req.json();
      const result = await ArticleBlockService.updateBlock(blockId, body);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update block error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/articles/[id]/blocks/[blockId] - Delete block (Admin & SuperAdmin)
  static deleteBlock = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'DELETE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { blockId } = await params;
      const result = await ArticleBlockService.deleteBlock(blockId);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete block error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
