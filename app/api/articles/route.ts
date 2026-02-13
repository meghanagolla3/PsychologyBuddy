import { NextRequest, NextResponse } from 'next/server';
import { LibraryController } from '@/src/components/server/content/library/library.controller';

// GET /api/articles - Get all articles (Admin & SuperAdmin)
export const GET = LibraryController.getArticles;

// POST /api/articles - Create article (Admin & SuperAdmin)
export const POST = LibraryController.createArticle;
