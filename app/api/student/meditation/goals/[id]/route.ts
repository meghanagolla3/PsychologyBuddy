import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { MeditationGoalsRepository } from '@/src/components/server/content/selfhelptools/meditation/meditation-goals.repository';
import { z } from 'zod';
import {
  GetStudentMeditationGoalByIdInput,
} from '@/src/components/server/content/selfhelptools/meditation/meditation-goals.validators';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.read');

    const { searchParams } = new URL(req.url);
    const parsed = GetStudentMeditationGoalByIdInput.parse({
      id: searchParams.get('id'),
    });

    const goal = await MeditationGoalsRepository.getStudentGoalById(parsed.id);

    if (!goal) {
      return NextResponse.json({
        success: false,
        error: {
          code: 404,
          message: 'Meditation goal not found',
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Meditation goal retrieved successfully',
      data: goal,
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
