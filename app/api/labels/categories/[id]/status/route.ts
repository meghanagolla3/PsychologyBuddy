import { NextRequest } from 'next/server';
import { CategoryController } from '@/src/server/controllers/category.controller';

// PATCH /api/categories/[id]/status - Update category status (Admin & SuperAdmin)
export const PATCH = CategoryController.updateCategoryStatus;
