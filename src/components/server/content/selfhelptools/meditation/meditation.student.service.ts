import { AuthError } from '@/src/utils/errors';
import { MeditationRepository } from './meditation.repository';
import {
  GetStudentMeditationsInput,
  GetStudentMeditationByIdInput,
  GetMeditationsByTypeInput,
  GetMeditationsByCategoryInput,
  GetMeditationsByGoalInput,
} from './meditation.validators';

export class MeditationStudentService {
  // Helper method to verify student scope
  private static async verifyStudentScope(userId: string) {
    // This would typically check if user has student permissions
    // For now, we'll assume user is valid if they have a session
    return { id: userId, role: 'STUDENT' }; // Simplified for demo
  }

  // Student Meditation Access (Read-only)
  static async getMeditations(userId: string, params: GetStudentMeditationsInput) {
    try {
      await this.verifyStudentScope(userId);

      const result = await MeditationRepository.getMeditations({
        page: params.page,
        limit: params.limit,
        search: params.search,
        type: params.type,
        category: params.category,
        goal: params.goal,
        status: 'PUBLISHED', // Students only see published meditations
      });

      return {
        success: true,
        message: 'Meditations retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Get student meditations error:', {
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

  static async getMeditationById(userId: string, params: GetStudentMeditationByIdInput) {
    try {
      await this.verifyStudentScope(userId);

      const meditation = await MeditationRepository.getMeditationById(params.id);

      if (!meditation) {
        throw new AuthError('Meditation not found', 404);
      }

      // Students can only access published meditations
      if (meditation.status !== 'PUBLISHED') {
        throw new AuthError('Meditation not available', 403);
      }

      return {
        success: true,
        message: 'Meditation retrieved successfully',
        data: meditation,
      };
    } catch (error) {
      console.error('Get student meditation by ID error:', {
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

  static async getMeditationsByType(userId: string, params: GetMeditationsByTypeInput) {
    try {
      await this.verifyStudentScope(userId);

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
      console.error('Get student meditations by type error:', {
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
      await this.verifyStudentScope(userId);

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
      console.error('Get student meditations by category error:', {
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
      await this.verifyStudentScope(userId);

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
      console.error('Get student meditations by goal error:', {
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
