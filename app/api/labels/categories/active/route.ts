import { NextRequest } from 'next/server';
import { CategoryController } from '@/src/components/server/content/labels/categories/category.controller';

// GET /api/categories/active - Get active categories only (Admin & SuperAdmin)
export const GET = CategoryController.getActiveCategories;
