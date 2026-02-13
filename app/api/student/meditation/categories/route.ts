import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { MeditationCategoriesRepository } from '@/src/components/server/content/selfhelptools/meditation/meditation-categories.repository';
import { z } from 'zod';
import {
  GetStudentMeditationCategoriesInput,
} from '@/src/components/server/content/selfhelptools/meditation/meditation-categories.validators';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.read');

    const { searchParams } = new URL(req.url);
    const parsed = GetStudentMeditationCategoriesInput.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      search: searchParams.get('search') || undefined,
    });

    const result = await MeditationCategoriesRepository.getStudentCategories(parsed);

    return NextResponse.json({
      success: true,
      message: 'Meditation categories retrieved successfully',
      data: result,
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
