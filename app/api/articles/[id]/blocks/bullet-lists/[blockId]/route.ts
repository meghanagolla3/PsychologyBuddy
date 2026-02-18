import { NextRequest, NextResponse } from 'next/server';
import { BulletListBlockController } from '@/src/server/content/library/bullet-list-block.controller';

// PUT /api/articles/[id]/blocks/bullet-lists/[blockId] - Update bullet-list block (Admin & SuperAdmin)
export const PUT = BulletListBlockController.updateBlock;

// DELETE /api/articles/[id]/blocks/bullet-lists/[blockId] - Delete bullet-list block (Admin & SuperAdmin)
export const DELETE = BulletListBlockController.deleteBlock;
