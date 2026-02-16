import { NextRequest, NextResponse } from 'next/server';
import { SectionBlockController } from '@/src/components/server/content/library/section-block.controller';

// GET /api/articles/[id]/blocks/sections - Get section blocks (Admin & SuperAdmin)
export const GET = SectionBlockController.getBlocks;

// POST /api/articles/[id]/blocks/sections - Add section block (Admin & SuperAdmin)
export const POST = SectionBlockController.addBlock;
