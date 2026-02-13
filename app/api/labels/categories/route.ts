import { NextRequest } from 'next/server';
import { CategoryController } from '@/src/components/server/content/labels/categories/category.controller';

// GET /api/labels/categories - Get all categories (Admin & SuperAdmin)
export const GET = CategoryController.getCategories;

// POST /api/labels/categories - Create category (Admin & SuperAdmin)
export const POST = CategoryController.createCategory;
