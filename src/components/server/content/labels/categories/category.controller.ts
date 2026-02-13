import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from './category.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import { CreateCategorySchema, UpdateCategorySchema, UpdateCategoryStatusSchema } from './category.validators';

export class CategoryController {
  // GET /api/admin/content/categories - Get all categories (Admin & SuperAdmin)
  static getCategories = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest) => {
    try {
      const result = await CategoryService.getAllCategories();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get categories error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/admin/content/categories/active - Get active categories only (Admin & SuperAdmin)
  static getActiveCategories = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest) => {
    try {
      const result = await CategoryService.getActiveCategories();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get active categories error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/admin/content/categories - Create category (Admin & SuperAdmin)
  static createCategory = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'CREATE' 
  })(async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = CreateCategorySchema.parse(body);
      
      const result = await CategoryService.createCategory(validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Create category error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/admin/content/categories/[id] - Get category by ID (Admin & SuperAdmin)
  static getCategoryById = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const result = await CategoryService.getCategoryById(params.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get category error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/admin/content/categories/[id] - Update category (Admin & SuperAdmin)
  static updateCategory = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const body = await req.json();
      const validatedData = UpdateCategorySchema.parse(body);
      
      const result = await CategoryService.updateCategory(params.id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update category error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PATCH /api/admin/content/categories/[id]/status - Update category status (Admin & SuperAdmin)
  static updateCategoryStatus = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const body = await req.json();
      const validatedData = UpdateCategoryStatusSchema.parse(body);
      
      const result = await CategoryService.updateCategoryStatus(params.id, validatedData.status);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update category status error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/admin/content/categories/[id] - Delete category (Admin & SuperAdmin)
  static deleteCategory = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'DELETE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const result = await CategoryService.deleteCategory(params.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete category error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
