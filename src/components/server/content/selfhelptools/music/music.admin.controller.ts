import { NextRequest, NextResponse } from 'next/server';
import { MusicAdminService } from './music.admin.service';
import { getSession, requirePermission } from '@/src/utils/session-helper';
import { ApiResponse } from '@/src/utils/api-response';
import { z } from 'zod';
import type {
  CreateMusicResourceInput,
  UpdateMusicResourceInput,
  DeleteMusicResourceInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
  CreateGoalInput,
  UpdateGoalInput,
  DeleteGoalInput,
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

export class MusicAdminController {
  // Music Resources Management
  async createMusicResource(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const body = await req.json();
      const parsed: CreateMusicResourceInput = z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        url: z.string().url(),
        duration: z.number().min(1).optional(),
        artist: z.string().optional(),
        album: z.string().optional(),
        coverImage: z.string().url().optional(),
        isPublic: z.boolean().default(true),
        status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
        categoryIds: z.array(z.string()).default([]),
        goalIds: z.array(z.string()).default([]),
      }).parse(body);

      const result = await MusicAdminService.createMusicResource(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMusicResource(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.view');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Music resource ID is required' } },
          { status: 400 }
        );
      }

      const result = await MusicAdminService.getMusicResource(id);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMusicResources(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.view');

      const { searchParams } = new URL(req.url);
      const filters = {
        category: searchParams.get('category') || undefined,
        mood: searchParams.get('mood') || undefined,
        goal: searchParams.get('goal') || undefined,
        status: (searchParams.get('status') as 'DRAFT' | 'PUBLISHED') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      };

      const result = await MusicAdminService.getMusicResources(filters);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async updateMusicResource(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Music resource ID is required' } },
          { status: 400 }
        );
      }

      const body = await req.json();
      const parsed: UpdateMusicResourceInput = z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        url: z.string().url().optional(),
        duration: z.number().min(1).optional(),
        artist: z.string().optional(),
        album: z.string().optional(),
        coverImage: z.string().url().optional(),
        isPublic: z.boolean().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        categoryIds: z.array(z.string()).optional(),
        goalIds: z.array(z.string()).optional(),
      }).parse(body);

      const result = await MusicAdminService.updateMusicResource(session.userId, id, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async deleteMusicResource(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Music resource ID is required' } },
          { status: 400 }
        );
      }

      const result = await MusicAdminService.deleteMusicResource(session.userId, id);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // Categories Management
  async createCategory(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const body = await req.json();
      const parsed: CreateCategoryInput = z.object({
        name: z.string().min(1, 'Category name is required'),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
      }).parse(body);

      const result = await MusicAdminService.createCategory(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getCategories(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.view');

      const result = await MusicAdminService.getCategories();

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async updateCategory(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Category ID is required' } },
          { status: 400 }
        );
      }

      const body = await req.json();
      const parsed: UpdateCategoryInput = z.object({
        name: z.string().min(1).optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
      }).parse(body);

      const result = await MusicAdminService.updateCategory(session.userId, id, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async deleteCategory(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Category ID is required' } },
          { status: 400 }
        );
      }

      const result = await MusicAdminService.deleteCategory(session.userId, id);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // Goals Management
  async createGoal(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const body = await req.json();
      const parsed: CreateGoalInput = z.object({
        name: z.string().min(1),
      }).parse(body);

      const result = await MusicAdminService.createGoal(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getGoals(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.view');

      const result = await MusicAdminService.getGoals();

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async updateGoal(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Goal ID is required' } },
          { status: 400 }
        );
      }

      const body = await req.json();
      const parsed: UpdateGoalInput = z.object({
        name: z.string().min(1).optional(),
      }).parse(body);

      const result = await MusicAdminService.updateGoal(session.userId, id, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async deleteGoal(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Goal ID is required' } },
          { status: 400 }
        );
      }

      const result = await MusicAdminService.deleteGoal(session.userId, id);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }
}

export const musicAdminController = new MusicAdminController();
