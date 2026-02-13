import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { MeditationGoalsRepository } from '@/src/components/server/content/selfhelptools/meditation/meditation-goals.repository';
import { z } from 'zod';
import {
  UpdateMeditationGoalInput,
  DeleteMeditationGoalInput,
  GetMeditationGoalByIdInput,
} from '@/src/components/server/content/selfhelptools/meditation/meditation-goals.validators';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.update');

    const { searchParams } = new URL(req.url);
    const parsed = GetMeditationGoalByIdInput.parse({
      id: searchParams.get('id'),
    });

    const goal = await MeditationGoalsRepository.getGoalById(parsed.id);

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

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.update');

    const { searchParams } = new URL(req.url);
    const body = await req.json();
    
    const parsed = z.object({
      id: z.string().min(1, 'Goal ID is required'),
      ...UpdateMeditationGoalInput.shape,
    }).parse({
      ...body,
      id: searchParams.get('id'),
    });

    const goal = await MeditationGoalsRepository.updateGoal(parsed.id, parsed);

    return NextResponse.json({
      success: true,
      message: 'Meditation goal updated successfully',
      data: goal,
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.update');

    const { searchParams } = new URL(req.url);
    const parsed = DeleteMeditationGoalInput.parse({
      id: searchParams.get('id'),
    });

    // Check if goal exists
    const existingGoal = await MeditationGoalsRepository.getGoalById(parsed.id);
    if (!existingGoal) {
      return NextResponse.json({
        success: false,
        error: {
          code: 404,
          message: 'Meditation goal not found',
        },
      }, { status: 404 });
    }

    await MeditationGoalsRepository.deleteGoal(parsed.id);

    return NextResponse.json({
      success: true,
      message: 'Meditation goal deleted successfully',
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
