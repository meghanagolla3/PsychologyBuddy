import { NextRequest, NextResponse } from 'next/server';
import { MusicMoodsService } from '../services/music.moods.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import { CreateMusicMoodSchema, UpdateMusicMoodSchema } from '../validators/music.moods.validators';

export class MusicMoodsController {
  // GET /api/admin/music/moods - Get all music moods (Admin & SuperAdmin)
  static getMusicMoods = withPermission({ 
    module: 'SELF_HELP_MUSIC', 
    action: 'VIEW' 
  })(async (req: NextRequest) => {
    try {
      const result = await MusicMoodsService.getAllMusicMoods();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get music moods error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/admin/music/moods - Create music mood (Admin & SuperAdmin)
  static createMusicMood = withPermission({ 
    module: 'SELF_HELP_MUSIC', 
    action: 'CREATE' 
  })(async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = CreateMusicMoodSchema.parse(body);
      
      const result = await MusicMoodsService.createMusicMood(validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Create music mood error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/admin/music/moods/[id] - Get music mood by ID (Admin & SuperAdmin)
  static getMusicMoodById = withPermission({ 
    module: 'SELF_HELP_MUSIC', 
    action: 'VIEW' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const result = await MusicMoodsService.getMusicMoodById(params.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get music mood error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/admin/music/moods/[id] - Update music mood (Admin & SuperAdmin)
  static updateMusicMood = withPermission({ 
    module: 'SELF_HELP_MUSIC', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const body = await req.json();
      const validatedData = UpdateMusicMoodSchema.parse(body);
      
      const result = await MusicMoodsService.updateMusicMood(params.id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update music mood error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/admin/music/moods/[id] - Delete music mood (Admin & SuperAdmin)
  static deleteMusicMood = withPermission({ 
    module: 'SELF_HELP_MUSIC', 
    action: 'DELETE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const result = await MusicMoodsService.deleteMusicMood(params.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete music mood error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
