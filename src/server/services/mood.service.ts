import prisma from '@/src/prisma';
import { AuthError } from '@/src/utils/errors';
import { CreateMoodData, UpdateMoodData } from '../validators/mood.validators';

export class MoodService {
  // Create new mood
  static async createMood(data: CreateMoodData) {
    try {
      // Check if mood with same name already exists
      const existingMood = await prisma.moodLabel.findUnique({
        where: { name: data.name },
      });

      if (existingMood) {
        throw AuthError.conflict('Mood with this name already exists');
      }

      const mood = await prisma.moodLabel.create({
        data: {
          name: data.name,
        },
      });

      return {
        success: true,
        message: 'Mood created successfully',
        data: mood,
      };
    } catch (error) {
      console.error('Create mood error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to create mood', 500);
    }
  }

  // Get all moods
  static async getAllMoods() {
    try {
      const moods = await prisma.moodLabel.findMany({
        orderBy: { name: 'asc' },
      });

      return {
        success: true,
        message: 'Moods retrieved successfully',
        data: moods,
      };
    } catch (error) {
      console.error('Get moods error:', error);
      throw new AuthError('Failed to retrieve moods', 500);
    }
  }

  // Get mood by ID
  static async getMoodById(id: string) {
    try {
      const mood = await prisma.moodLabel.findUnique({
        where: { id },
      });

      if (!mood) {
        throw AuthError.notFound('Mood not found');
      }

      return {
        success: true,
        message: 'Mood retrieved successfully',
        data: mood,
      };
    } catch (error) {
      console.error('Get mood error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to retrieve mood', 500);
    }
  }

  // Update mood
  static async updateMood(id: string, data: UpdateMoodData) {
    try {
      // Check if mood exists
      const existingMood = await prisma.moodLabel.findUnique({
        where: { id },
      });

      if (!existingMood) {
        throw AuthError.notFound('Mood not found');
      }

      // If updating name, check for duplicates
      if (data.name && data.name !== existingMood.name) {
        const duplicateMood = await prisma.moodLabel.findUnique({
          where: { name: data.name },
        });

        if (duplicateMood) {
          throw AuthError.conflict('Mood with this name already exists');
        }
      }

      const updateData: any = {};
      if (data.name) updateData.name = data.name;

      const mood = await prisma.moodLabel.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'Mood updated successfully',
        data: mood,
      };
    } catch (error) {
      console.error('Update mood error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to update mood', 500);
    }
  }

  // Delete mood
  static async deleteMood(id: string) {
    try {
      // Check if mood exists
      const existingMood = await prisma.moodLabel.findUnique({
        where: { id },
        include: {
          articles: {
            select: { id: true },
            take: 1, // Just check if there are any articles
          },
        },
      });

      if (!existingMood) {
        throw AuthError.notFound('Mood not found');
      }

      // Check if mood is being used by any articles
      if (existingMood.articles.length > 0) {
        throw new AuthError('Cannot delete mood that is being used by articles', 400);
      }

      // Delete mood
      await prisma.moodLabel.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Mood deleted successfully',
        data: { id },
      };
    } catch (error) {
      console.error('Delete mood error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to delete mood', 500);
    }
  }
}
