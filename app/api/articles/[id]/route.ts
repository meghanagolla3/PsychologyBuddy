import { NextRequest, NextResponse } from 'next/server';
import { LibraryController } from '@/src/components/server/content/library/library.controller';

// GET /api/articles/[id] - Get article by ID (Admin & SuperAdmin)
export const GET = LibraryController.getArticleById;

// PUT /api/articles/[id] - Update article (Admin & SuperAdmin)
export const PUT = LibraryController.updateArticle;

// DELETE /api/articles/[id] - Delete article (Admin & SuperAdmin)
export const DELETE = LibraryController.deleteArticle;
