import { NextRequest } from 'next/server';
import { LibraryController } from '@/src/server/content/library/library.controller';

// GET /api/library/[id] - Get article by ID (Admin & SuperAdmin)
export const GET = LibraryController.getArticleById;

// PUT /api/library/[id] - Update article (Admin & SuperAdmin)
export const PUT = LibraryController.updateArticle;

// DELETE /api/library/[id] - Delete article (Admin & SuperAdmin)
export const DELETE = LibraryController.deleteArticle;
