import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { MeditationAdminService } from './meditation.admin.service';
import { z } from 'zod';

export class MeditationAdminController {
  // Meditation Resources Management
  async createMeditation(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.update');

      const body = await req.json();
      const parsed = z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        thumbnailUrl: z.string().url().optional(),
        format: z.string(),
        audioUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        durationSec: z.number().min(1, 'Duration is required').optional(),
        instructor: z.string().optional(),
        type: z.string().optional(),
        categoryIds: z.array(z.string()).optional(),
        goalIds: z.array(z.string()).optional(),
        status: z.string().default('DRAFT'),
        schoolId: z.string().optional(),
      }).parse(body);

      const result = await MeditationAdminService.createMeditation(session.userId, parsed as any);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMeditations(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.update');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
        categoryId: z.string().optional(),
        goalId: z.string().optional(),
        schoolId: z.string().optional(),
      }).parse({
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 20,
        search: searchParams.get('search') || undefined,
        type: searchParams.get('type') || undefined,
        status: searchParams.get('status') || undefined,
        categoryId: searchParams.get('categoryId') || undefined,
        goalId: searchParams.get('goalId') || undefined,
        schoolId: searchParams.get('schoolId') || undefined,
      });

      const result = await MeditationAdminService.getMeditations(session.userId, parsed as any);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMeditationById(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.update');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        id: z.string().min(1, 'Meditation ID is required'),
      }).parse({
        id: searchParams.get('id'),
      });

      const result = await MeditationAdminService.getMeditationById(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async updateMeditation(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.update');

      const { searchParams } = new URL(req.url);
      const body = await req.json();
      
      const parsed = z.object({
        id: z.string().min(1, 'Meditation ID is required'),
        title: z.string().min(1, 'Title is required').optional(),
        description: z.string().min(1, 'Description is required').optional(),
        thumbnailUrl: z.string().url().optional(),
        format: z.string().optional(),
        audioUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        durationSec: z.number().min(1, 'Duration is required').optional(),
        instructor: z.string().optional(),
        type: z.string().optional(),
        category: z.string().optional(),
        goal: z.string().optional(),
        status: z.string().optional(),
      }).parse({
        ...body,
        id: searchParams.get('id'),
      });

      const result = await MeditationAdminService.updateMeditation(session.userId, parsed as any);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async deleteMeditation(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.update');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        id: z.string().min(1, 'Meditation ID is required'),
      }).parse({
        id: searchParams.get('id'),
      });

      const result = await MeditationAdminService.deleteMeditation(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMeditationsByType(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.update');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        type: z.string().min(1, 'Type is required'),
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
      }).parse({
        type: searchParams.get('type'),
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 20,
      });

      const result = await MeditationAdminService.getMeditationsByType(session.userId, parsed as any);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMeditationsByCategory(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.update');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        category: z.string().min(1, 'Category is required'),
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
      }).parse({
        category: searchParams.get('category'),
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 20,
      });

      const result = await MeditationAdminService.getMeditationsByCategory(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMeditationsByGoal(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.update');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        goal: z.string().min(1, 'Goal is required'),
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
      }).parse({
        goal: searchParams.get('goal'),
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 20,
      });

      const result = await MeditationAdminService.getMeditationsByGoal(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }
}
