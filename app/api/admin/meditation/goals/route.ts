import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { MeditationGoalsRepository } from '@/src/components/server/content/selfhelptools/meditation/meditation-goals.repository';
import { z } from 'zod';
import {
  CreateMeditationGoalInput,
  GetMeditationGoalsInput,
} from '@/src/components/server/content/selfhelptools/meditation/meditation-goals.validators';

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.update');

    const body = await req.json();
    const parsed = CreateMeditationGoalInput.parse(body);

    const goal = await MeditationGoalsRepository.createGoal(parsed);

    return NextResponse.json({
      success: true,
      message: 'Meditation goal created successfully',
      data: goal,
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.update');

    const { searchParams } = new URL(req.url);
    const parsed = GetMeditationGoalsInput.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      search: searchParams.get('search') || undefined,
    });

    const result = await MeditationGoalsRepository.getGoals(parsed);

    return NextResponse.json({
      success: true,
      message: 'Meditation goals retrieved successfully',
      data: result,
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
