import { MusicRepository } from './music.repository';
import { AuthRepository } from '@/src/auth/auth.repository';
import { AuthError } from '@/src/utils/errors';
import type {
  CreateMusicResourceInput,
  UpdateMusicResourceInput,
  DeleteMusicResourceInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
  CreateGoalInput,
  UpdateGoalInput,
  DeleteGoalInput,
} from './music.validators';

export class MusicAdminService {
  // Verify admin scope
  private static async verifyAdminScope(userId: string) {
    const admin = await AuthRepository.findUserById(userId);
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role.name)) {
      throw new AuthError('Access denied. Admin role required.', 403);
    }
    return admin;
  }

  // Music Resource Management
  static async createMusicResource(userId: string, data: CreateMusicResourceInput) {
    try {
      const admin = await this.verifyAdminScope(userId);

      const resource = await MusicRepository.createMusicResource({
        ...data,
        // createdBy: userId, // This will be handled differently since we're using the new model
      });

      return {
        success: true,
        message: 'Music resource created successfully',
        data: resource,
      };
    } catch (error) {
      console.error('Create music resource error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        data
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to create music resource', 500);
    }
  }

  static async getMusicResource(id: string) {
    try {
      const resource = await MusicRepository.getMusicResource(id);
      
      if (!resource) {
        throw new AuthError('Music resource not found', 404);
      }

      return {
        success: true,
        message: 'Music resource retrieved successfully',
        data: resource,
      };
    } catch (error) {
      console.error('Get music resource error:', error);
      throw new AuthError('Failed to retrieve music resource', 500);
    }
  }

  static async getMusicResources(filters: {
    category?: string;
    mood?: string;
    goal?: string;
    status?: 'DRAFT' | 'PUBLISHED';
    page?: number;
    limit?: number;
  }) {
    try {
      const result = await MusicRepository.getMusicResources(filters);

      return {
        success: true,
        message: 'Music resources retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Get music resources error:', error);
      throw new AuthError('Failed to retrieve music resources', 500);
    }
  }

  static async updateMusicResource(userId: string, id: string, data: UpdateMusicResourceInput) {
    try {
      await this.verifyAdminScope(userId);

      // Check if resource exists
      const existing = await MusicRepository.getMusicResource(id);
      if (!existing) {
        throw new AuthError('Music resource not found', 404);
      }

      const resource = await MusicRepository.updateMusicResource(id, data);

      return {
        success: true,
        message: 'Music resource updated successfully',
        data: resource,
      };
    } catch (error) {
      console.error('Update music resource error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        id,
        data
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to update music resource', 500);
    }
  }

  static async deleteMusicResource(userId: string, id: string) {
    try {
      await this.verifyAdminScope(userId);

      // Check if resource exists
      const existing = await MusicRepository.getMusicResource(id);
      if (!existing) {
        throw new AuthError('Music resource not found', 404);
      }

      await MusicRepository.deleteMusicResource(id);

      return {
        success: true,
        message: 'Music resource deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete music resource error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        id
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to delete music resource', 500);
    }
  }

  // Categories Management
  static async createCategory(userId: string, data: CreateCategoryInput) {
    try {
      const admin = await this.verifyAdminScope(userId);

      const category = await MusicRepository.createCategory(data.name, data.status);

      return {
        success: true,
        message: 'Category created successfully',
        data: category,
      };
    } catch (error) {
      console.error('Create category error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        data
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Preserve the original error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      throw new AuthError(errorMessage, 500);
    }
  }

  static async getCategories() {
    try {
      const categories = await MusicRepository.getCategories();

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

  static async updateCategory(userId: string, id: string, data: UpdateCategoryInput) {
    try {
      await this.verifyAdminScope(userId);

      const category = await MusicRepository.updateCategory(id, data);

      return {
        success: true,
        message: 'Category updated successfully',
        data: category,
      };
    } catch (error) {
      console.error('Update category error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        id,
        data
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to update category', 500);
    }
  }

  static async deleteCategory(userId: string, id: string) {
    try {
      await this.verifyAdminScope(userId);

      await MusicRepository.deleteCategory(id);

      return {
        success: true,
        message: 'Category deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete category error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        id
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to delete category', 500);
    }
  }

  // Goal Management
  static async createGoal(userId: string, data: CreateGoalInput) {
    try {
      await this.verifyAdminScope(userId);

      const goal = await MusicRepository.createGoal(data.name);

      return {
        success: true,
        message: 'Goal created successfully',
        data: goal,
      };
    } catch (error) {
      console.error('Create goal error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        data
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to create goal', 500);
    }
  }

  static async getGoals() {
    try {
      const goals = await MusicRepository.getGoals();

      return {
        success: true,
        message: 'Goals retrieved successfully',
        data: goals,
      };
    } catch (error) {
      console.error('Get goals error:', error);
      throw new AuthError('Failed to retrieve goals', 500);
    }
  }

  static async updateGoal(userId: string, id: string, data: UpdateGoalInput) {
    try {
      await this.verifyAdminScope(userId);

      const goal = await MusicRepository.updateGoal(id, data);

      return {
        success: true,
        message: 'Goal updated successfully',
        data: goal,
      };
    } catch (error) {
      console.error('Update goal error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        id,
        data
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to update goal', 500);
    }
  }

  static async deleteGoal(userId: string, id: string) {
    try {
      await this.verifyAdminScope(userId);

      await MusicRepository.deleteGoal(id);

      return {
        success: true,
        message: 'Goal deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete goal error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        id
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to delete goal', 500);
    }
  }
}
