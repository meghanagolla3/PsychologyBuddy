import { AuthError } from '@/src/utils/errors';
import { MeditationRepository } from './meditation.repository';
import {
  CreateMeditationInput,
  UpdateMeditationInput,
  DeleteMeditationInput,
  GetMeditationsInput,
  GetMeditationByIdInput,
  GetMeditationsByTypeInput,
  GetMeditationsByCategoryInput,
  GetMeditationsByGoalInput,
} from './meditation.validators';

export class MeditationAdminService {
  // Helper method to verify admin scope
  private static async verifyAdminScope(userId: string) {
    // This would typically check if user has admin permissions
    // For now, we'll assume user is valid if they have a session
    return { id: userId, role: 'ADMIN', schoolId: undefined }; // Simplified for demo
  }

  // Meditation Resources Management
  static async createMeditation(userId: string, data: CreateMeditationInput) {
    try {
      const admin = await this.verifyAdminScope(userId);

      const meditation = await MeditationRepository.createMeditation({
        ...data,
        createdBy: userId,
        schoolId: admin.schoolId || null,
      });

      return {
        success: true,
        message: 'Meditation created successfully',
        data: meditation,
      };
    } catch (error) {
      console.error('Create meditation error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        data
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create meditation';
      throw new AuthError(errorMessage, 500);
    }
  }

  static async getMeditations(userId: string, params: GetMeditationsInput) {
    try {
      const admin = await this.verifyAdminScope(userId);

      const result = await MeditationRepository.getMeditations({
        page: params.page,
        limit: params.limit,
        search: params.search,
        type: params.type,
        status: params.status,
        category: params.category,
        goal: params.goal,
        schoolId: admin.schoolId || undefined,
      });

      return {
        success: true,
        message: 'Meditations retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Get meditations error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        params
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve meditations';
      throw new AuthError(errorMessage, 500);
    }
  }

  static async getMeditationById(userId: string, params: GetMeditationByIdInput) {
    try {
      await this.verifyAdminScope(userId);

      const meditation = await MeditationRepository.getMeditationById(params.id);

      if (!meditation) {
        throw new AuthError('Meditation not found', 404);
      }

      return {
        success: true,
        message: 'Meditation retrieved successfully',
        data: meditation,
      };
    } catch (error) {
      console.error('Get meditation by ID error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        params
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve meditation';
      throw new AuthError(errorMessage, 500);
    }
  }

  static async updateMeditation(userId: string, params: { id: string } & UpdateMeditationInput) {
    try {
      await this.verifyAdminScope(userId);

      // Check if meditation exists
      const existingMeditation = await MeditationRepository.getMeditationById(params.id);
      if (!existingMeditation) {
        throw new AuthError('Meditation not found', 404);
      }

      const { id, ...updateData } = params;
      const meditation = await MeditationRepository.updateMeditation(id, updateData);

      return {
        success: true,
        message: 'Meditation updated successfully',
        data: meditation,
      };
    } catch (error) {
      console.error('Update meditation error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        params
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update meditation';
      throw new AuthError(errorMessage, 500);
    }
  }

  static async deleteMeditation(userId: string, params: DeleteMeditationInput) {
    try {
      await this.verifyAdminScope(userId);

      // Check if meditation exists
      const existingMeditation = await MeditationRepository.getMeditationById(params.id);
      if (!existingMeditation) {
        throw new AuthError('Meditation not found', 404);
      }

      await MeditationRepository.deleteMeditation(params.id);

      return {
        success: true,
        message: 'Meditation deleted successfully',
      };
    } catch (error) {
      console.error('Delete meditation error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        params
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete meditation';
      throw new AuthError(errorMessage, 500);
    }
  }

  static async getMeditationsByType(userId: string, params: GetMeditationsByTypeInput) {
    try {
      await this.verifyAdminScope(userId);

      const result = await MeditationRepository.getMeditationsByType(params.type, {
        page: params.page,
        limit: params.limit,
      });

      return {
        success: true,
        message: 'Meditations by type retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Get meditations by type error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        params
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve meditations by type';
      throw new AuthError(errorMessage, 500);
    }
  }

  static async getMeditationsByCategory(userId: string, params: GetMeditationsByCategoryInput) {
    try {
      await this.verifyAdminScope(userId);

      const result = await MeditationRepository.getMeditationsByCategory(params.category, {
        page: params.page,
        limit: params.limit,
      });

      return {
        success: true,
        message: 'Meditations by category retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Get meditations by category error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        params
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve meditations by category';
      throw new AuthError(errorMessage, 500);
    }
  }

  static async getMeditationsByGoal(userId: string, params: GetMeditationsByGoalInput) {
    try {
      await this.verifyAdminScope(userId);

      const result = await MeditationRepository.getMeditationsByGoal(params.goal, {
        page: params.page,
        limit: params.limit,
      });

      return {
        success: true,
        message: 'Meditations by goal retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Get meditations by goal error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        params
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve meditations by goal';
      throw new AuthError(errorMessage, 500);
    }
  }
}
