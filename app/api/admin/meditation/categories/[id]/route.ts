import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { MeditationCategoriesRepository } from '@/src/components/server/content/selfhelptools/meditation/meditation-categories.repository';
import { z } from 'zod';
import {
  UpdateMeditationCategoryInput,
  DeleteMeditationCategoryInput,
  GetMeditationCategoryByIdInput,
} from '@/src/components/server/content/selfhelptools/meditation/meditation-categories.validators';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.update');

    const { searchParams } = new URL(req.url);
    const parsed = GetMeditationCategoryByIdInput.parse({
      id: searchParams.get('id'),
    });

    const category = await MeditationCategoriesRepository.getCategoryById(parsed.id);

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

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'selfhelp.meditation.update');

    const { searchParams } = new URL(req.url);
    const body = await req.json();
    
    const parsed = z.object({
      id: z.string().min(1, 'Category ID is required'),
      ...UpdateMeditationCategoryInput.shape,
    }).parse({
      ...body,
      id: searchParams.get('id'),
    });

    const category = await MeditationCategoriesRepository.updateCategory(parsed.id, parsed);

    return NextResponse.json({
      success: true,
      message: 'Meditation category updated successfully',
      data: category,
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
    const parsed = DeleteMeditationCategoryInput.parse({
      id: searchParams.get('id'),
    });

    // Check if category exists
    const existingCategory = await MeditationCategoriesRepository.getCategoryById(parsed.id);
    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: {
          code: 404,
          message: 'Meditation category not found',
        },
      }, { status: 404 });
    }

    await MeditationCategoriesRepository.deleteCategory(parsed.id);

    return NextResponse.json({
      success: true,
      message: 'Meditation category deleted successfully',
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
