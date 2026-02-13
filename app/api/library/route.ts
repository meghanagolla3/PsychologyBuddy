import { NextRequest } from 'next/server';
import { LibraryController } from '@/src/components/server/content/library/library.controller';

// GET /api/library - Get all articles (Admin & SuperAdmin)
export const GET = LibraryController.getArticles;

// POST /api/library - Create article (Admin & SuperAdmin)
export const POST = LibraryController.createArticle;
