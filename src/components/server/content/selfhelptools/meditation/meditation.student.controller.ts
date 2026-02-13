import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { MeditationStudentService } from './meditation.student.service';
import { z } from 'zod';

export class MeditationStudentController {
  // Student Meditation Access (Read-only)
  async getMeditations(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.read');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.string().optional(),
        category: z.string().optional(),
        goal: z.string().optional(),
      }).parse({
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 20,
        search: searchParams.get('search') || undefined,
        type: searchParams.get('type') || undefined,
        category: searchParams.get('category') || undefined,
        goal: searchParams.get('goal') || undefined,
      });

      const result = await MeditationStudentService.getMeditations(session.userId, parsed as any);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMeditationById(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.read');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        id: z.string().min(1, 'Meditation ID is required'),
      }).parse({
        id: searchParams.get('id'),
      });

      const result = await MeditationStudentService.getMeditationById(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMeditationsByType(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.read');

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

      const result = await MeditationStudentService.getMeditationsByType(session.userId, parsed as any);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMeditationsByCategory(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.read');

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

      const result = await MeditationStudentService.getMeditationsByCategory(session.userId, parsed as any);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getMeditationsByGoal(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.meditation.read');

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

      const result = await MeditationStudentService.getMeditationsByGoal(session.userId, parsed as any);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }
}
