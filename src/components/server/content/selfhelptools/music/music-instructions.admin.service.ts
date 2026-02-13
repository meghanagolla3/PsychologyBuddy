import { MusicInstructionsRepository } from './music-instructions.repository';
import { AuthError } from '@/src/utils/errors';
import type {
  CreateInstructionInput,
  UpdateInstructionInput,
  DeleteInstructionInput,
  GetInstructionsInput,
  GetInstructionByIdInput,
} from './music-instructions.validators';

export class MusicInstructionsAdminService {
  // Helper method to verify admin scope
  private static async verifyAdminScope(userId: string) {
    // This would typically check if user has admin permissions
    // For now, we'll assume user is valid if they have a session
    return { id: userId, role: 'ADMIN', schoolId: null }; // Simplified for demo
  }

  // Music Listening Instructions Management
  static async createInstruction(userId: string, data: CreateInstructionInput) {
    try {
      const admin = await this.verifyAdminScope(userId);

      const instruction = await MusicInstructionsRepository.createInstruction({
        ...data,
        createdBy: userId,
        schoolId: admin.schoolId || null,
      });

      return {
        success: true,
        message: 'Music listening instruction created successfully',
        data: instruction,
      };
    } catch (error) {
      console.error('Create instruction error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        data
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create instruction';
      throw new AuthError(errorMessage, 500);
    }
  }

  static async getInstruction(id: string) {
    try {
      const instruction = await MusicInstructionsRepository.getInstruction(id);
      
      if (!instruction) {
        throw new AuthError('Music listening instruction not found', 404);
      }

      return {
        success: true,
        message: 'Music listening instruction retrieved successfully',
        data: instruction,
      };
    } catch (error) {
      console.error('Get instruction error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        id
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve instruction', 500);
    }
  }

  static async getInstructions(filters: GetInstructionsInput) {
    try {
      const result = await MusicInstructionsRepository.getInstructions(filters);

      return {
        success: true,
        message: 'Music listening instructions retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Get instructions error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        filters
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve instructions', 500);
    }
  }

  static async updateInstruction(userId: string, id: string, data: UpdateInstructionInput) {
    try {
      const admin = await this.verifyAdminScope(userId);

      const instruction = await MusicInstructionsRepository.updateInstruction(id, data);

      return {
        success: true,
        message: 'Music listening instruction updated successfully',
        data: instruction,
      };
    } catch (error) {
      console.error('Update instruction error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        id,
        data
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to update instruction', 500);
    }
  }

  static async deleteInstruction(userId: string, id: string) {
    try {
      const admin = await this.verifyAdminScope(userId);

      await MusicInstructionsRepository.deleteInstruction(id);

      return {
        success: true,
        message: 'Music listening instruction deleted successfully',
      };
    } catch (error) {
      console.error('Delete instruction error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        id
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to delete instruction', 500);
    }
  }

  // Get instructions by resource
  static async getInstructionsByResource(resourceId: string) {
    try {
      const instructions = await MusicInstructionsRepository.getInstructionsByResource(resourceId);

      return {
        success: true,
        message: 'Music listening instructions for resource retrieved successfully',
        data: instructions,
      };
    } catch (error) {
      console.error('Get instructions by resource error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        resourceId
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve instructions for resource', 500);
    }
  }
}
