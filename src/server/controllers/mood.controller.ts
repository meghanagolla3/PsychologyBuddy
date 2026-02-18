import { NextRequest, NextResponse } from 'next/server';
import { MoodService } from '../services/mood.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import { CreateMoodSchema, UpdateMoodSchema } from '../validators/mood.validators';

export class MoodController {
  // GET /api/labels/moods - Get all moods (Admin & SuperAdmin)
  static getMoods = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest) => {
    try {
      const result = await MoodService.getAllMoods();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get moods error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/labels/moods - Create mood (Admin & SuperAdmin)
  static createMood = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'CREATE' 
  })(async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = CreateMoodSchema.parse(body);
      
      const result = await MoodService.createMood(validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Create mood error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/labels/moods/[id] - Get mood by ID (Admin & SuperAdmin)
  static getMoodById = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const result = await MoodService.getMoodById(params.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get mood error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/labels/moods/[id] - Update mood (Admin & SuperAdmin)
  static updateMood = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const body = await req.json();
      const validatedData = UpdateMoodSchema.parse(body);
      
      const result = await MoodService.updateMood(params.id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update mood error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/labels/moods/[id] - Delete mood (Admin & SuperAdmin)
  static deleteMood = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'DELETE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const result = await MoodService.deleteMood(params.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete mood error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
