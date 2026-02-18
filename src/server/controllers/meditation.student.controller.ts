import { NextRequest, NextResponse } from "next/server";
import { MeditationStudentService } from "../services/meditation.student.service";
import {
  GetStudentMeditationsSchema,
  GetStudentMeditationByIdSchema,
  GetStudentMeditationCategoriesSchema,
  GetStudentMeditationGoalsSchema,
  GetStudentMeditationInstructionsSchema,
} from "../validators/meditation.validators";
import { handlePrismaError, formatErrorResponse, asyncHandler } from "@/src/utils/error-handler";

const meditationStudentService = new MeditationStudentService();

// ====================================
//        STUDENT MEDITATION CONTROLLERS
// ====================================

export const getStudentMeditations = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters correctly handling arrays
  const queryData: Record<string, any> = {};
  
  // Handle array parameters
  for (const [key, value] of searchParams.entries()) {
    if (key.endsWith('Ids')) {
      if (!queryData[key]) {
        queryData[key] = [];
      }
      queryData[key].push(value);
    } else if (!queryData[key]) {
      queryData[key] = value;
    }
  }
  
  const validatedData = GetStudentMeditationsSchema.parse(queryData);

  // Get user context from JWT/session
  const schoolId = request.headers.get('x-school-id') || undefined;

  // Add user context
  const contextData = {
    ...validatedData,
    schoolId,
  };

  const result = await meditationStudentService.getStudentMeditations(contextData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getStudentMeditationById = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetStudentMeditationByIdSchema.parse(queryData);

  // Get user context from JWT/session
  const schoolId = request.headers.get('x-school-id') || undefined;

  const contextData = {
    ...validatedData,
    schoolId,
  };

  const result = await meditationStudentService.getStudentMeditationById(contextData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const getStudentMeditationCategories = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetStudentMeditationCategoriesSchema.parse(queryData);

  const result = await meditationStudentService.getStudentMeditationCategories(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getStudentMeditationGoals = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetStudentMeditationGoalsSchema.parse(queryData);

  const result = await meditationStudentService.getStudentMeditationGoals(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getStudentMeditationInstructions = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters correctly handling arrays
  const queryData: Record<string, any> = {};
  
  // Handle array parameters
  for (const [key, value] of searchParams.entries()) {
    if (key.endsWith('Ids')) {
      if (!queryData[key]) {
        queryData[key] = [];
      }
      queryData[key].push(value);
    } else if (!queryData[key]) {
      queryData[key] = value;
    }
  }
  
  const validatedData = GetStudentMeditationInstructionsSchema.parse(queryData);

  // Get user context from JWT/session
  const schoolId = request.headers.get('x-school-id') || undefined;

  // Add user context
  const contextData = {
    ...validatedData,
    schoolId,
  };

  const result = await meditationStudentService.getStudentMeditationInstructions(contextData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});
