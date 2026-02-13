import { MusicRepository } from './music.repository';
import { AuthError } from '@/src/utils/errors';
import type {
  GetMusicResourcesInput,
  GetMusicResourceByIdInput,
} from './music.validators';

export class MusicStudentService {
  // Student Music Instruction - READ ONLY access to published music resources
  static async getMusicResources(filters: GetMusicResourcesInput) {
    try {
      // Only return published resources for students
      const result = await MusicRepository.getMusicResources({
        ...filters,
        status: 'PUBLISHED',
      });

      return {
        success: true,
        message: 'Music resources retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Get music resources error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        filters
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve music resources', 500);
    }
  }

  static async getMusicResourceById(id: string) {
    try {
      const resource = await MusicRepository.getMusicResource(id);
      
      if (!resource) {
        throw new AuthError('Music resource not found', 404);
      }

      // Students can only access published resources
      if (resource.status !== 'PUBLISHED') {
        throw new AuthError('Music resource not available', 403);
      }

      return {
        success: true,
        message: 'Music resource retrieved successfully',
        data: resource,
      };
    } catch (error) {
      console.error('Get music resource error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        id
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve music resource', 500);
    }
  }

  // Get music resources by category
  static async getMusicByCategory(category: string, filters: Omit<GetMusicResourcesInput, 'category'>) {
    try {
      const result = await MusicRepository.getMusicResources({
        ...filters,
        category,
        status: 'PUBLISHED',
      });

      return {
        success: true,
        message: `Music resources in category "${category}" retrieved successfully`,
        data: result,
      };
    } catch (error) {
      console.error('Get music by category error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        category,
        filters
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve music by category', 500);
    }
  }

  // Get music resources by mood
  static async getMusicByMood(mood: string, filters: Omit<GetMusicResourcesInput, 'mood'>) {
    try {
      const result = await MusicRepository.getMusicResources({
        ...filters,
        mood,
        status: 'PUBLISHED',
      });

      return {
        success: true,
        message: `Music resources for mood "${mood}" retrieved successfully`,
        data: result,
      };
    } catch (error) {
      console.error('Get music by mood error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        mood,
        filters
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve music by mood', 500);
    }
  }

  // Get music resources by goal
  static async getMusicByGoal(goal: string, filters: Omit<GetMusicResourcesInput, 'goal'>) {
    try {
      const result = await MusicRepository.getMusicResources({
        ...filters,
        goal,
        status: 'PUBLISHED',
      });

      return {
        success: true,
        message: `Music resources for goal "${goal}" retrieved successfully`,
        data: result,
      };
    } catch (error) {
      console.error('Get music by goal error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        goal,
        filters
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve music by goal', 500);
    }
  }

  // Get featured/recommended music resources
  static async getFeaturedMusic(limit: number = 10) {
    try {
      const result = await MusicRepository.getMusicResources({
        status: 'PUBLISHED',
        page: 1,
        limit,
      });

      return {
        success: true,
        message: 'Featured music resources retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Get featured music error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        limit
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve featured music', 500);
    }
  }
}
