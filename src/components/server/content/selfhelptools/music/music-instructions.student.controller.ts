import { NextRequest, NextResponse } from 'next/server';
import { MusicInstructionsStudentService } from './music-instructions.student.service';
import { getSession, requireRole } from '@/src/utils/session-helper';
import { ApiResponse } from '@/src/utils/api-response';
import { z } from 'zod';
import type {
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

export class MusicInstructionsStudentController {
  // Student Music Listening Instructions - READ ONLY
  async getInstructions(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const { searchParams } = new URL(req.url);
      const filters: GetInstructionsInput = {
        difficulty: (searchParams.get('difficulty') as any) || undefined,
        status: (searchParams.get('status') as any) || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      };

      const result = await MusicInstructionsStudentService.getInstructions(filters);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getInstruction(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          ApiResponse.error('Instruction ID is required', 400),
          { status: 400 }
        );
      }

      const result = await MusicInstructionsStudentService.getInstructionById(id);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getInstructionsByDifficulty(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const { searchParams } = new URL(req.url);
      const difficulty = searchParams.get('difficulty');

      if (!difficulty) {
        return NextResponse.json(
          ApiResponse.error('Difficulty is required', 400),
          { status: 400 }
        );
      }

      const filters: GetInstructionsInput = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      };

      const result = await MusicInstructionsStudentService.getInstructionsByDifficulty(difficulty, filters);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getInstructionsWithResource(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const { searchParams } = new URL(req.url);
      const resourceId = searchParams.get('resourceId');

      if (!resourceId) {
        return NextResponse.json(
          ApiResponse.error('Resource ID is required', 400),
          { status: 400 }
        );
      }

      const filters: GetInstructionsInput = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
      };

      const result = await MusicInstructionsStudentService.getInstructionsWithResource(resourceId, filters);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }
}

export const musicInstructionsStudentController = new MusicInstructionsStudentController();
