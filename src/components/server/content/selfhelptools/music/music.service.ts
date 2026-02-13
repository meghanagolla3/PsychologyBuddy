import { MusicRepository } from './music.repository';
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
  GetMusicResourcesInput,
  GetMusicResourceByIdInput,
} from './music.validators';

export class MusicService {
  // Admin Music Resource Management
  static async createMusicResource(userId: string, data: CreateMusicResourceInput) {
    try {
      const resource = await MusicRepository.createMusicResource({
        ...data,
        createdBy: userId,
      });

      return {
        success: true,
        message: 'Music resource created successfully',
        data: resource,
      };
    } catch (error) {
      console.error('Create music resource error:', error);
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

  static async getMusicResources(filters: GetMusicResourcesInput) {
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

  static async updateMusicResource(id: string, data: UpdateMusicResourceInput) {
    try {
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
      console.error('Update music resource error:', error);
      throw new AuthError('Failed to update music resource', 500);
    }
  }

  static async deleteMusicResource(id: string) {
    try {
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
      console.error('Delete music resource error:', error);
      throw new AuthError('Failed to delete music resource', 500);
    }
  }

  // Category Management
  static async createCategory(data: CreateCategoryInput) {
    try {
      const category = await MusicRepository.createCategory(data.name, data.status);

      return {
        success: true,
        message: 'Category created successfully',
        data: category,
      };
    } catch (error) {
      console.error('Create category error:', error);
      throw new AuthError('Failed to create category', 500);
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

  static async updateCategory(id: string, data: UpdateCategoryInput) {
    try {
      const category = await MusicRepository.updateCategory(id, data);

      return {
        success: true,
        message: 'Category updated successfully',
        data: category,
      };
    } catch (error) {
      console.error('Update category error:', error);
      throw new AuthError('Failed to update category', 500);
    }
  }

  static async deleteCategory(id: string) {
    try {
      await MusicRepository.deleteCategory(id);

      return {
        success: true,
        message: 'Category deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete category error:', error);
      throw new AuthError('Failed to delete category', 500);
    }
  }

  // Goal Management
  static async createGoal(data: CreateGoalInput) {
    try {
      const goal = await MusicRepository.createGoal(data.name);

      return {
        success: true,
        message: 'Goal created successfully',
        data: goal,
      };
    } catch (error) {
      console.error('Create goal error:', error);
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

  static async updateGoal(id: string, data: UpdateGoalInput) {
    try {
      const goal = await MusicRepository.updateGoal(id, data);

      return {
        success: true,
        message: 'Goal updated successfully',
        data: goal,
      };
    } catch (error) {
      console.error('Update goal error:', error);
      throw new AuthError('Failed to update goal', 500);
    }
  }

  static async deleteGoal(id: string) {
    try {
      await MusicRepository.deleteGoal(id);

      return {
        success: true,
        message: 'Goal deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete goal error:', error);
      throw new AuthError('Failed to delete goal', 500);
    }
  }
}
