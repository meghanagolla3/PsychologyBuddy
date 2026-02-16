import { NextRequest, NextResponse } from 'next/server';
import { SectionBlockService } from './section-block.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

export class SectionBlockController {
  // GET /api/articles/[id]/blocks/sections - Get section blocks (Admin & SuperAdmin)
  static getBlocks = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const result = await SectionBlockService.getBlocks(id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get section blocks error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/articles/[id]/blocks/sections - Add section block (Admin & SuperAdmin)
  static addBlock = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'CREATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const result = await SectionBlockService.addBlock(id, body);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Add section block error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/articles/[id]/blocks/sections/[blockId] - Update section block (Admin & SuperAdmin)
  static updateBlock = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { blockId } = await params;
      const body = await req.json();
      const result = await SectionBlockService.updateBlock(blockId, body);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update section block error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/articles/[id]/blocks/sections/[blockId] - Delete section block (Admin & SuperAdmin)
  static deleteBlock = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'DELETE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { blockId } = await params;
      const result = await SectionBlockService.deleteBlock(blockId);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete section block error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
