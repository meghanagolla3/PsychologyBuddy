import prisma from '@/src/prisma';
import { AuthError } from '@/src/utils/errors';
import { CreateCategoryData, UpdateCategoryData, UpdateCategoryStatusData } from '../validators/category.validators';

export class CategoryService {
  // Create new category
  static async createCategory(data: CreateCategoryData) {
    try {
      console.log('Creating category with data:', data);
      
      // Check if category with same name already exists
      const existingCategory = await prisma.categoryLabel.findUnique({
        where: { name: data.name },
      });
      
      console.log('Existing category:', existingCategory);

      if (existingCategory) {
        throw AuthError.conflict('Category with this name already exists');
      }

      console.log('Creating new category in Prisma...');
      const category = await prisma.categoryLabel.create({
        data: {
          name: data.name,
          status: data.status,
        },
      });
      console.log('Category created:', category);

      return {
        success: true,
        message: 'Category created successfully',
        data: category,
      };
    } catch (error) {
      console.error('Create category error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to create category', 500);
    }
  }

  // Get all categories
  static async getAllCategories() {
    try {
      const categories = await prisma.categoryLabel.findMany({
        orderBy: [
          { status: 'desc' }, // ACTIVE first
          { name: 'asc' },
        ],
      });

      return {
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
      };
    } catch (error) {
      console.error('Get categories error:', error);
      throw new AuthError('Failed to retrieve categories', 500);
    }
  }

  // Get active categories only (for dropdowns)
  static async getActiveCategories() {
    try {
      const categories = await prisma.categoryLabel.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      });

      return {
        success: true,
        message: 'Active categories retrieved successfully',
        data: categories,
      };
    } catch (error) {
      console.error('Get active categories error:', error);
      throw new AuthError('Failed to retrieve active categories', 500);
    }
  }

  // Get category by ID
  static async getCategoryById(id: string) {
    try {
      const category = await prisma.categoryLabel.findUnique({
        where: { id },
      });

      if (!category) {
        throw AuthError.notFound('Category not found');
      }

      return {
        success: true,
        message: 'Category retrieved successfully',
        data: category,
      };
    } catch (error) {
      console.error('Get category error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to retrieve category', 500);
    }
  }

  // Update category
  static async updateCategory(id: string, data: UpdateCategoryData) {
    try {
      // Check if category exists
      const existingCategory = await prisma.categoryLabel.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw AuthError.notFound('Category not found');
      }

      // If updating name, check for duplicates
      if (data.name && data.name !== existingCategory.name) {
        const duplicateCategory = await prisma.categoryLabel.findUnique({
          where: { name: data.name },
        });

        if (duplicateCategory) {
          throw AuthError.conflict('Category with this name already exists');
        }
      }

      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.status) updateData.status = data.status;

      const category = await prisma.categoryLabel.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'Category updated successfully',
        data: category,
      };
    } catch (error) {
      console.error('Update category error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to update category', 500);
    }
  }

  // Delete category
  static async deleteCategory(id: string) {
    try {
      // Check if category exists
      const existingCategory = await prisma.categoryLabel.findUnique({
        where: { id },
        include: {
          articles: {
            select: { id: true },
            take: 1, // Just check if there are any articles
          },
        },
      });

      if (!existingCategory) {
        throw AuthError.notFound('Category not found');
      }

      // Check if category is being used by any articles
      if (existingCategory.articles.length > 0) {
        throw new AuthError('Cannot delete category that is being used by articles', 400);
      }

      // Delete category
      await prisma.categoryLabel.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Category deleted successfully',
        data: { id },
      };
    } catch (error) {
      console.error('Delete category error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to delete category', 500);
    }
  }

  // Update category status only
  static async updateCategoryStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    try {
      const existingCategory = await prisma.categoryLabel.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw AuthError.notFound('Category not found');
      }

      const category = await prisma.categoryLabel.update({
        where: { id },
        data: { status },
      });

      return {
        success: true,
        message: `Category ${status.toLowerCase()} successfully`,
        data: category,
      };
    } catch (error) {
      console.error('Update category status error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to update category status', 500);
    }
  }
}
