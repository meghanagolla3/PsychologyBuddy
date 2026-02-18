import { CreateMusicMoodInput, UpdateMusicMoodInput } from '../validators/music.moods.validators';
import prisma from "@/src/prisma";

export class MusicMoodsService {
  // Get all music moods
  static async getAllMusicMoods() {
    try {
      const moods = await prisma.musicMood.findMany({
        orderBy: { name: 'asc' }
      });
      
      return {
        success: true,
        data: moods,
        message: 'Music moods retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching music moods:', error);
      return {
        success: false,
        error: 'Failed to fetch music moods',
        code: 500
      };
    }
  }

  // Get music mood by ID
  static async getMusicMoodById(id: string) {
    try {
      const mood = await prisma.musicMood.findUnique({
        where: { id }
      });
      
      if (!mood) {
        return {
          success: false,
          error: 'Music mood not found',
          code: 404
        };
      }
      
      return {
        success: true,
        data: mood,
        message: 'Music mood retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching music mood:', error);
      return {
        success: false,
        error: 'Failed to fetch music mood',
        code: 500
      };
    }
  }

  // Create new music mood
  static async createMusicMood(data: CreateMusicMoodInput) {
    try {
      // Check if mood with same name already exists
      const existingMood = await prisma.musicMood.findUnique({
        where: { name: data.name }
      });
      
      if (existingMood) {
        return {
          success: false,
          error: 'Music mood with this name already exists',
          code: 409
        };
      }
      
      const mood = await prisma.musicMood.create({
        data
      });
      
      return {
        success: true,
        data: mood,
        message: 'Music mood created successfully'
      };
    } catch (error) {
      console.error('Error creating music mood:', error);
      return {
        success: false,
        error: 'Failed to create music mood',
        code: 500
      };
    }
  }

  // Update music mood
  static async updateMusicMood(id: string, data: UpdateMusicMoodInput) {
    try {
      // Check if mood exists
      const existingMood = await prisma.musicMood.findUnique({
        where: { id }
      });
      
      if (!existingMood) {
        return {
          success: false,
          error: 'Music mood not found',
          code: 404
        };
      }
      
      // If updating name, check for duplicates
      if (data.name && data.name !== existingMood.name) {
        const duplicateMood = await prisma.musicMood.findUnique({
          where: { name: data.name }
        });
        
        if (duplicateMood) {
          return {
            success: false,
            error: 'Music mood with this name already exists',
            code: 409
          };
        }
      }
      
      const mood = await prisma.musicMood.update({
        where: { id },
        data
      });
      
      return {
        success: true,
        data: mood,
        message: 'Music mood updated successfully'
      };
    } catch (error) {
      console.error('Error updating music mood:', error);
      return {
        success: false,
        error: 'Failed to update music mood',
        code: 500
      };
    }
  }

  // Delete music mood
  static async deleteMusicMood(id: string) {
    try {
      // Check if mood exists
      const existingMood = await prisma.musicMood.findUnique({
        where: { id },
        include: {
          musicResources: true
        }
      });
      
      if (!existingMood) {
        return {
          success: false,
          error: 'Music mood not found',
          code: 404
        };
      }
      
      // Check if mood is being used by any music resources
      if (existingMood.musicResources.length > 0) {
        return {
          success: false,
          error: 'Cannot delete mood that is being used by music resources',
          code: 400
        };
      }
      
      await prisma.musicMood.delete({
        where: { id }
      });
      
      return {
        success: true,
        message: 'Music mood deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting music mood:', error);
      return {
        success: false,
        error: 'Failed to delete music mood',
        code: 500
      };
    }
  }
}
