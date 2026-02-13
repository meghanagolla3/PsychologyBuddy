import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { MeditationGoalsRepository } from '@/src/components/server/content/selfhelptools/meditation/meditation-goals.repository';
import { z } from 'zod';
import {
  GetStudentMeditationGoalsInput,
} from '@/src/components/server/content/selfhelptools/meditation/meditation-goals.validators';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.read');

    const { searchParams } = new URL(req.url);
    const parsed = GetStudentMeditationGoalsInput.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      search: searchParams.get('search') || undefined,
    });

    const result = await MeditationGoalsRepository.getStudentGoals(parsed);

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
