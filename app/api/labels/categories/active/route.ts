import { NextRequest } from 'next/server';
import { CategoryController } from '@/src/server/controllers/category.controller';

// GET /api/categories/active - Get active categories only (Admin & SuperAdmin)
export const GET = CategoryController.getActiveCategories;
