import { NextRequest, NextResponse } from 'next/server';
import { ArticleBlockController } from '@/src/components/server/content/library/article-block.controller';

// GET /api/articles/[id]/blocks - Get article blocks (Admin & SuperAdmin)
export const GET = ArticleBlockController.getBlocks;

// POST /api/articles/[id]/blocks - Add block (Admin & SuperAdmin)
export const POST = ArticleBlockController.addBlock;

// PATCH /api/articles/[id]/blocks - Update block order (Admin & SuperAdmin)
export const PATCH = ArticleBlockController.updateBlockOrder;
