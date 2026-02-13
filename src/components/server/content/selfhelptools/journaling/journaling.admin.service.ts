import { JournalingAdminRepository } from './journaling.admin.repository';
import { JournalingUtils } from './journaling.utils';
import { AuthError } from '@/src/utils/errors';
import { 
  UpdateJournalingConfigInput,
  CreateJournalingPromptInput,
  UpdateJournalingPromptInput,
  DeleteJournalingPromptInput,
  GetJournalingConfigInput
} from './journaling.validators';

export class JournalingAdminService {
  // Journaling Config Management
  static async getJournalingConfig(userId: string, query: GetJournalingConfigInput) {
    try {
      // Verify admin scope
      const admin = await JournalingAdminRepository.getAdminSchool(userId);
      if (!admin) {
        throw new AuthError('Admin user not found', 404);
      }

      // Check if admin can access this school
      if (admin.role.name !== 'SUPER_ADMIN' && admin.schoolId !== query.schoolId) {
        throw new AuthError('Access denied. You can only manage your own school.', 403);
      }

      const config = await JournalingUtils.getOrCreateDefaultConfig(query.schoolId);

      return {
        success: true,
        message: 'Journaling config retrieved successfully',
        data: config,
      };
    } catch (error) {
      console.error('Get journaling config error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        query
      });
      
      // Re-throw original error if it's an AuthError
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new AuthError('Failed to retrieve journaling config', 500);
    }
  }

  static async updateJournalingConfig(userId: string, data: UpdateJournalingConfigInput) {
    try {
      // Verify admin scope
      const admin = await JournalingAdminRepository.getAdminSchool(userId);
      if (!admin) {
        throw new AuthError('Admin user not found', 404);
      }

      const schoolId = admin.schoolId;
      if (!schoolId) {
        throw new AuthError('Admin must be associated with a school', 400);
      }

      const config = await JournalingAdminRepository.updateJournalingConfig(schoolId, data);

      return {
        success: true,
        message: 'Journaling config updated successfully',
        data: config,
      };
    } catch (error) {
      console.error('Update journaling config error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        data
      });
      
      // Re-throw original error if it's an AuthError
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new AuthError('Failed to update journaling config', 500);
    }
  }

  // Journaling Prompts Management
  static async createPrompt(userId: string, data: CreateJournalingPromptInput) {
    try {
      // Verify admin is authorized
      const admin = await JournalingAdminRepository.getAdminSchool(userId);
      if (!admin) {
        throw new AuthError('Admin user not found', 404);
      }

      const prompt = await JournalingAdminRepository.createPrompt(data.text, data.moodIds);

      return {
        success: true,
        message: 'Journaling prompt created successfully',
        data: prompt,
      };
    } catch (error) {
      console.error('Create journaling prompt error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        data
      });
      
      // Re-throw original error if it's an AuthError
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new AuthError('Failed to create journaling prompt', 500);
    }
  }

  static async getAllPrompts(userId: string) {
    try {
      // Verify admin is authorized
      const admin = await JournalingAdminRepository.getAdminSchool(userId);
      if (!admin) {
        throw new AuthError('Admin user not found', 404);
      }

      const prompts = await JournalingAdminRepository.getAllPrompts();

      return {
        success: true,
        message: 'Journaling prompts retrieved successfully',
        data: prompts,
      };
    } catch (error) {
      console.error('Get journaling prompts error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId
      });
      
      // Re-throw original error if it's an AuthError
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new AuthError('Failed to retrieve journaling prompts', 500);
    }
  }

  static async updatePrompt(userId: string, promptId: string, data: UpdateJournalingPromptInput) {
    try {
      // Verify admin is authorized
      const admin = await JournalingAdminRepository.getAdminSchool(userId);
      if (!admin) {
        throw new AuthError('Admin user not found', 404);
      }

      // Check if prompt exists
      const existingPrompt = await JournalingAdminRepository.getPromptById(promptId);
      if (!existingPrompt) {
        throw new AuthError('Prompt not found', 404);
      }

      const prompt = await JournalingAdminRepository.updatePrompt(promptId, data);

      return {
        success: true,
        message: 'Journaling prompt updated successfully',
        data: prompt,
      };
    } catch (error) {
      console.error('Update journaling prompt error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        promptId,
        data
      });
      
      // Re-throw original error if it's an AuthError
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new AuthError('Failed to update journaling prompt', 500);
    }
  }

  static async deletePrompt(userId: string, data: DeleteJournalingPromptInput) {
    try {
      // Verify admin is authorized
      const admin = await JournalingAdminRepository.getAdminSchool(userId);
      if (!admin) {
        throw new AuthError('Admin user not found', 404);
      }

      // Check if prompt exists
      const existingPrompt = await JournalingAdminRepository.getPromptById(data.id);
      if (!existingPrompt) {
        throw new AuthError('Prompt not found', 404);
      }

      await JournalingAdminRepository.deletePrompt(data.id);

      return {
        success: true,
        message: 'Journaling prompt deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete journaling prompt error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        data
      });
      
      // Re-throw original error if it's an AuthError
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new AuthError('Failed to delete journaling prompt', 500);
    }
  }
}
