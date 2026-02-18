import { PrismaClient } from '../../generated/prisma/client';
import prisma from '../../prisma';

export class MeditationMoodService {
  static async getAllMeditationMoods() {
    try {
      const moods = await prisma.moodLabel.findMany({
        where: {
          type: 'MEDITATION'
        },
        orderBy: {
          name: 'asc'
        }
      });

      return moods;
    } catch (error) {
      console.error('Error fetching meditation moods:', error);
      throw error;
    }
  }

  static async createMeditationMood(data: { name: string; status?: string }) {
    try {
      console.log('Creating meditation mood with data:', data);
      const newMood = await prisma.moodLabel.create({
        data: {
          name: data.name,
          type: 'MEDITATION'
        }
      });

      console.log('Successfully created meditation mood:', newMood);
      return newMood;
    } catch (error) {
      console.error('Error creating meditation mood:', error);
      throw error;
    }
  }
}
