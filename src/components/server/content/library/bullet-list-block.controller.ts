import { NextRequest, NextResponse } from 'next/server';
import { BulletListBlockService } from './bullet-list-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

export class BulletListBlockController {
  // GET /api/articles/[id]/blocks/bullet-lists - Get bullet-list blocks (Admin & SuperAdmin)
  static getBlocks = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const result = await BulletListBlockService.getBlocks(id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get bullet-list blocks error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/articles/[id]/blocks/bullet-lists - Add bullet-list block (Admin & SuperAdmin)
  static addBlock = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'CREATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const result = await BulletListBlockService.addBlock(id, body);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Add bullet-list block error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/articles/[id]/blocks/bullet-lists/[blockId] - Update bullet-list block (Admin & SuperAdmin)
  static updateBlock = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { blockId } = await params;
      const body = await req.json();
      const result = await BulletListBlockService.updateBlock(blockId, body);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update bullet-list block error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/articles/[id]/blocks/bullet-lists/[blockId] - Delete bullet-list block (Admin & SuperAdmin)
  static deleteBlock = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'DELETE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { blockId } = await params;
      const result = await BulletListBlockService.deleteBlock(blockId);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete bullet-list block error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
