import { NextRequest, NextResponse } from 'next/server';
import { MusicInstructionsAdminService } from './music-instructions.admin.service';
import { getSession, requirePermission } from '@/src/utils/session-helper';
import { ApiResponse } from '@/src/utils/api-response';
import { z } from 'zod';
import type {
  CreateInstructionInput,
  UpdateInstructionInput,
  DeleteInstructionInput,
  GetInstructionsInput,
  GetInstructionByIdInput,
} from './music-instructions.validators';

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

export class MusicInstructionsAdminController {
  // Music Listening Instructions Management
  async createInstruction(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const body = await req.json();
      const parsed: CreateInstructionInput = z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        steps: z.array(z.object({
          stepNumber: z.number().min(1, 'Step number is required'),
          title: z.string().min(1, 'Step title is required'),
          description: z.string().min(1, 'Step description is required'),
          duration: z.number().min(1, 'Step duration is required').optional(),
          resources: z.array(z.string()).optional(),
        })).min(1, 'At least one step is required'),
        duration: z.number().min(1, 'Duration is required').optional(),
        difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
        status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
        resourceId: z.string().optional(),
      }).parse(body);

      const result = await MusicInstructionsAdminService.createInstruction(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getInstructions(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.view');

      const { searchParams } = new URL(req.url);
      const filters: GetInstructionsInput = {
        difficulty: (searchParams.get('difficulty') as any) || undefined,
        status: (searchParams.get('status') as any) || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      };

      const result = await MusicInstructionsAdminService.getInstructions(filters);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getInstruction(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.view');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Instruction ID is required' } },
          { status: 400 }
        );
      }

      const result = await MusicInstructionsAdminService.getInstruction(id);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async updateInstruction(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Instruction ID is required' } },
          { status: 400 }
        );
      }

      const body = await req.json();
      const parsed: UpdateInstructionInput = z.object({
        title: z.string().min(1, 'Title is required').optional(),
        description: z.string().min(1, 'Description is required').optional(),
        steps: z.array(z.object({
          stepNumber: z.number().min(1, 'Step number is required'),
          title: z.string().min(1, 'Step title is required'),
          description: z.string().min(1, 'Step description is required'),
          duration: z.number().min(1, 'Step duration is required').optional(),
          resources: z.array(z.string()).optional(),
        })).optional(),
        duration: z.number().min(1, 'Duration is required').optional(),
        difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        resourceId: z.string().optional(),
      }).parse(body);

      const result = await MusicInstructionsAdminService.updateInstruction(session.userId, id, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async deleteInstruction(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.update');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { message: 'Instruction ID is required' } },
          { status: 400 }
        );
      }

      const result = await MusicInstructionsAdminService.deleteInstruction(session.userId, id);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getInstructionsByResource(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'selfhelp.music.view');

      const { searchParams } = new URL(req.url);
      const resourceId = searchParams.get('resourceId');

      if (!resourceId) {
        return NextResponse.json(
          { success: false, error: { message: 'Resource ID is required' } },
          { status: 400 }
        );
      }

      const result = await MusicInstructionsAdminService.getInstructionsByResource(resourceId);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }
}

export const musicInstructionsAdminController = new MusicInstructionsAdminController();
