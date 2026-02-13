import { MusicInstructionsRepository } from './music-instructions.repository';
import { AuthError } from '@/src/utils/errors';
import type {
  GetInstructionsInput,
  GetInstructionByIdInput,
} from './music-instructions.validators';

export class MusicInstructionsStudentService {
  // Student Music Listening Instructions - READ ONLY access to published instructions
  static async getInstructions(filters: GetInstructionsInput) {
    try {
      const result = await MusicInstructionsRepository.getInstructions({
        ...filters,
        status: 'PUBLISHED', // Students only see published instructions
      });

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

  static async getInstructionById(id: string) {
    try {
      const instruction = await MusicInstructionsRepository.getInstruction(id);
      
      if (!instruction) {
        throw new AuthError('Music listening instruction not found', 404);
      }

      // Students can only access published instructions
      if (instruction.status !== 'PUBLISHED') {
        throw new AuthError('Music listening instruction not available', 403);
      }

      return {
        success: true,
        message: 'Music listening instruction retrieved successfully',
        data: instruction,
      };
    } catch (error) {
      console.error('Get instruction by ID error:', {
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

  // Get instructions by difficulty level
  static async getInstructionsByDifficulty(difficulty: string, filters: Omit<GetInstructionsInput, 'difficulty'>) {
    try {
      const result = await MusicInstructionsRepository.getInstructions({
        ...filters,
        difficulty,
        status: 'PUBLISHED',
      });

      return {
        success: true,
        message: `Music listening instructions for ${difficulty} level retrieved successfully`,
        data: result,
      };
    } catch (error) {
      console.error('Get instructions by difficulty error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        difficulty,
        filters
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve instructions by difficulty', 500);
    }
  }

  // Get instructions that include a specific music resource
  static async getInstructionsWithResource(resourceId: string, filters: Omit<GetInstructionsInput, 'resourceId'>) {
    try {
      const result = await MusicInstructionsRepository.getInstructions({
        ...filters,
        status: 'PUBLISHED',
      });

      // Filter instructions that include the specified resource
      const filteredInstructions = result.instructions.filter(
        instruction => instruction.resourceId === resourceId
      );

      return {
        success: true,
        message: 'Music listening instructions with resource retrieved successfully',
        data: {
          ...result,
          instructions: filteredInstructions,
        },
      };
    } catch (error) {
      console.error('Get instructions with resource error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        resourceId,
        filters
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError('Failed to retrieve instructions with resource', 500);
    }
  }
}
