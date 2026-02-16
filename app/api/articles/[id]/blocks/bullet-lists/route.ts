import { NextRequest, NextResponse } from 'next/server';
import { BulletListBlockController } from '@/src/components/server/content/library/bullet-list-block.controller';

// GET /api/articles/[id]/blocks/bullet-lists - Get bullet-list blocks (Admin & SuperAdmin)
export const GET = BulletListBlockController.getBlocks;

// POST /api/articles/[id]/blocks/bullet-lists - Add bullet-list block (Admin & SuperAdmin)
export const POST = BulletListBlockController.addBlock;
