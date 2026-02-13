import { JournalingStudentRepository } from './journaling.student.repository';
import { JournalingUtils } from './journaling.utils';
import { AuthError } from '@/src/utils/errors';
import { 
  CreateWritingJournalInput, 
  CreateAudioJournalInput, 
  CreateArtJournalInput,
  DeleteWritingJournalInput,
  DeleteAudioJournalInput,
  DeleteArtJournalInput
} from './journaling.validators';

export class JournalingStudentService {
  // Writing Journals
  static async createWritingJournal(userId: string, schoolId: string | null, data: CreateWritingJournalInput) {
    try {
      // Validate schoolId
      if (!schoolId) {
        throw new AuthError('User must be associated with a school', 400);
      }

      // Check if writing journaling is enabled for this school
      const config = await JournalingUtils.getOrCreateDefaultConfig(schoolId);
      if (!config?.enableWriting) {
        throw new AuthError('Writing journaling is disabled for your school', 403);
      }

      const journal = await JournalingStudentRepository.createWritingJournal(
        userId, 
        data.title, 
        data.content
      );

      return {
        success: true,
        message: 'Writing journal created successfully',
        data: journal,
      };
    } catch (error) {
      console.error('Create writing journal error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        schoolId,
        data
      });
      
      // Re-throw the original error if it's an AuthError
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new AuthError('Failed to create writing journal', 500);
    }
  }

  static async getWritingJournals(userId: string) {
    try {
      const journals = await JournalingStudentRepository.getWritingJournals(userId);

      return {
        success: true,
        message: 'Writing journals retrieved successfully',
        data: journals,
      };
    } catch (error) {
      console.error('Get writing journals error:', error);
      throw new AuthError('Failed to retrieve writing journals', 500);
    }
  }

  static async deleteWritingJournal(userId: string, data: DeleteWritingJournalInput) {
    try {
      // First verify the journal belongs to the user
      const journal = await JournalingStudentRepository.getWritingJournalById(data.id, userId);
      if (!journal) {
        throw new AuthError('Journal not found or access denied', 404);
      }

      await JournalingStudentRepository.deleteWritingJournal(data.id, userId);

      return {
        success: true,
        message: 'Writing journal deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete writing journal error:', error);
      throw new AuthError('Failed to delete writing journal', 500);
    }
  }

  // Audio Journals
  static async createAudioJournal(userId: string, schoolId: string | null, data: CreateAudioJournalInput) {
    try {
      // Validate schoolId
      if (!schoolId) {
        throw new AuthError('User must be associated with a school', 400);
      }

      // Check if audio journaling is enabled for this school
      const config = await JournalingUtils.getOrCreateDefaultConfig(schoolId);
      if (!config?.enableAudio) {
        throw new AuthError('Audio journaling is disabled for your school', 403);
      }

      // Validate duration against school config
      if (data.duration > config.maxAudioDuration) {
        throw new AuthError(`Audio duration exceeds maximum allowed duration of ${config.maxAudioDuration} seconds`, 400);
      }

      const journal = await JournalingStudentRepository.createAudioJournal(
        userId,
        data.title,
        data.audioUrl,
        data.duration
      );

      return {
        success: true,
        message: 'Audio journal created successfully',
        data: journal,
      };
    } catch (error) {
      console.error('Create audio journal error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        schoolId,
        data
      });
      
      // Re-throw original error if it's an AuthError
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new AuthError('Failed to create audio journal', 500);
    }
  }

  static async getAudioJournals(userId: string) {
    try {
      const journals = await JournalingStudentRepository.getAudioJournals(userId);

      return {
        success: true,
        message: 'Audio journals retrieved successfully',
        data: journals,
      };
    } catch (error) {
      console.error('Get audio journals error:', error);
      throw new AuthError('Failed to retrieve audio journals', 500);
    }
  }

  static async deleteAudioJournal(userId: string, data: DeleteAudioJournalInput) {
    try {
      // First verify the journal belongs to the user
      const journal = await JournalingStudentRepository.getAudioJournalById(data.id, userId);
      if (!journal) {
        throw new AuthError('Journal not found or access denied', 404);
      }

      await JournalingStudentRepository.deleteAudioJournal(data.id, userId);

      return {
        success: true,
        message: 'Audio journal deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete audio journal error:', error);
      throw new AuthError('Failed to delete audio journal', 500);
    }
  }

  // Art Journals
  static async createArtJournal(userId: string, schoolId: string | null, data: CreateArtJournalInput) {
    try {
      // Validate schoolId
      if (!schoolId) {
        throw new AuthError('User must be associated with a school', 400);
      }

      // Check if art journaling is enabled for this school
      const config = await JournalingUtils.getOrCreateDefaultConfig(schoolId);
      if (!config?.enableArt) {
        throw new AuthError('Art journaling is disabled for your school', 403);
      }

      const journal = await JournalingStudentRepository.createArtJournal(userId, data.imageUrl);

      return {
        success: true,
        message: 'Art journal created successfully',
        data: journal,
      };
    } catch (error) {
      console.error('Create art journal error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        schoolId,
        data
      });
      
      // Re-throw original error if it's an AuthError
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new AuthError('Failed to create art journal', 500);
    }
  }

  static async getArtJournals(userId: string) {
    try {
      const journals = await JournalingStudentRepository.getArtJournals(userId);

      return {
        success: true,
        message: 'Art journals retrieved successfully',
        data: journals,
      };
    } catch (error) {
      console.error('Get art journals error:', error);
      throw new AuthError('Failed to retrieve art journals', 500);
    }
  }

  static async deleteArtJournal(userId: string, data: DeleteArtJournalInput) {
    try {
      // First verify the journal belongs to the user
      const journal = await JournalingStudentRepository.getArtJournalById(data.id, userId);
      if (!journal) {
        throw new AuthError('Journal not found or access denied', 404);
      }

      await JournalingStudentRepository.deleteArtJournal(data.id, userId);

      return {
        success: true,
        message: 'Art journal deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete art journal error:', error);
      throw new AuthError('Failed to delete art journal', 500);
    }
  }
}
