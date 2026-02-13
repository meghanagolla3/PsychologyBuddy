import { NextRequest, NextResponse } from 'next/server';
import { MusicStudentService } from './music.student.service';
import { getSession, requireRole } from '@/src/utils/session-helper';
import { ApiResponse } from '@/src/utils/api-response';
import { z } from 'zod';
import type {
  GetMusicResourcesInput,
  GetMusicResourceByIdInput,
} from './music.validators';

// Error handler function
function handleError(err: any) {
  console.error('API Error:', err);
  
  if (err.code) {
    return ApiResponse.error(err.message, err.code);
  }
  
  if (err.message) {
    return ApiResponse.error(err.message, 500);
  }
  
  return ApiResponse.error('Internal server error', 500);
}

export class MusicStudentController {
  // Get all music resources with filters
  async getMusicResources(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const { searchParams } = new URL(req.url);
      const filters: GetMusicResourcesInput = {
        category: searchParams.get('category') || undefined,
        goal: searchParams.get('goal') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      };

      const result = await MusicStudentService.getMusicResources(filters);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // Get single music resource by ID
  async getMusicResourceById(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          ApiResponse.error('Music resource ID is required', 400),
          { status: 400 }
        );
      }

      const result = await MusicStudentService.getMusicResourceById(id);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // Get music by category
  async getMusicByCategory(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category');

      if (!category) {
        return NextResponse.json(
          ApiResponse.error('Category is required', 400),
          { status: 400 }
        );
      }

      const filters = {
        goal: searchParams.get('goal') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      };

      const result = await MusicStudentService.getMusicByCategory(category, filters);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // Get music by goal
  async getMusicByGoal(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const { searchParams } = new URL(req.url);
      const goal = searchParams.get('goal');

      if (!goal) {
        return NextResponse.json(
          ApiResponse.error('Goal is required', 400),
          { status: 400 }
        );
      }

      const filters = {
        category: searchParams.get('category') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      };

      const result = await MusicStudentService.getMusicByGoal(goal, filters);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // Get featured music
  async getFeaturedMusic(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') || '10');

      const result = await MusicStudentService.getFeaturedMusic(limit);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }
}

export const musicStudentController = new MusicStudentController();
