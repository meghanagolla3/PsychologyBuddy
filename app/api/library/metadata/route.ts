import { NextRequest } from 'next/server';
import { LibraryController } from '@/src/server/content/library/library.controller';

// GET /api/library/metadata - Get categories, moods, and goals (Admin & SuperAdmin)
export const GET = LibraryController.getLibraryMetadata;
