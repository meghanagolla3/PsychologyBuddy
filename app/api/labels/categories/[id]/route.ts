import { NextRequest } from 'next/server';
import { CategoryController } from '@/src/components/server/content/labels/categories/category.controller';

// GET /api/categories/[id] - Get category by ID (Admin & SuperAdmin)
export const GET = CategoryController.getCategoryById;

// PUT /api/categories/[id] - Update category (Admin & SuperAdmin)
export const PUT = CategoryController.updateCategory;

// DELETE /api/categories/[id] - Delete category (Admin & SuperAdmin)
export const DELETE = CategoryController.deleteCategory;
