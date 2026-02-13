import { NextRequest } from 'next/server';
import { CategoryController } from '@/src/components/server/content/labels/categories/category.controller';

// PATCH /api/categories/[id]/status - Update category status (Admin & SuperAdmin)
export const PATCH = CategoryController.updateCategoryStatus;
