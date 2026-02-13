import { NextRequest, NextResponse } from 'next/server';
import { ArticleBlockController } from '@/src/components/server/content/library/article-block.controller';

// PUT /api/articles/[id]/blocks/[blockId] - Update block (Admin & SuperAdmin)
export const PUT = ArticleBlockController.updateBlock;

// DELETE /api/articles/[id]/blocks/[blockId] - Delete block (Admin & SuperAdmin)
export const DELETE = ArticleBlockController.deleteBlock;
