import { NextRequest, NextResponse } from 'next/server';
import { SectionBlockController } from '@/src/components/server/content/library/section-block.controller';

// PUT /api/articles/[id]/blocks/sections/[blockId] - Update section block (Admin & SuperAdmin)
export const PUT = SectionBlockController.updateBlock;

// DELETE /api/articles/[id]/blocks/sections/[blockId] - Delete section block (Admin & SuperAdmin)
export const DELETE = SectionBlockController.deleteBlock;
