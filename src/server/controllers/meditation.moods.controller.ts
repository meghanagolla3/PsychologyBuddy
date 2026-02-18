import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/src/types/api.types';
import { MeditationMoodService } from '@/src/server/services/meditation.mood.service';
import { CreateMeditationMoodSchema } from '@/src/server/validators/meditation.validators';

export class MeditationMoodsController {
  static async getMeditationMoods(req: NextRequest) {
    try {
      const moods = await MeditationMoodService.getAllMeditationMoods();
      
      return NextResponse.json({
        success: true,
        data: moods,
        message: 'Meditation moods retrieved successfully'
      } as ApiResponse<typeof moods>);
    } catch (error) {
      console.error('Error fetching meditation moods:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch meditation moods'
      } as ApiResponse<null>, { status: 500 });
    }
  }

  static async createMeditationMood(req: NextRequest) {
    try {
      const body = await req.json();
      const validatedData = CreateMeditationMoodSchema.parse(body);
      
      const newMood = await MeditationMoodService.createMeditationMood(validatedData);
      
      return NextResponse.json({
        success: true,
        data: newMood,
        message: 'Meditation mood created successfully'
      } as ApiResponse<typeof newMood>);
    } catch (error) {
      console.error('Error creating meditation mood:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create meditation mood'
      } as ApiResponse<null>, { status: 500 });
    }
  }
}
