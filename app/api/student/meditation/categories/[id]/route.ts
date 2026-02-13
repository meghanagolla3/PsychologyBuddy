import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { MeditationCategoriesRepository } from '@/src/components/server/content/selfhelptools/meditation/meditation-categories.repository';
import { z } from 'zod';
import {
  GetStudentMeditationCategoryByIdInput,
} from '@/src/components/server/content/selfhelptools/meditation/meditation-categories.validators';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.read');

    const { searchParams } = new URL(req.url);
    const parsed = GetStudentMeditationCategoryByIdInput.parse({
      id: searchParams.get('id'),
    });

    const category = await MeditationCategoriesRepository.getStudentCategoryById(parsed.id);

    if (!category) {
      return NextResponse.json({
        success: false,
        error: {
          code: 404,
          message: 'Meditation category not found',
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Meditation category retrieved successfully',
      data: category,
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
