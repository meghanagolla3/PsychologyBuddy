import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/prisma";
import { MeditationAdminService } from "../services/meditation.admin.service";
import {
  CreateMeditationResourceSchema,
  UpdateMeditationResourceSchema,
  GetMeditationResourcesSchema,
  GetSingleMeditationResourceSchema,
  CreateMeditationCategorySchema,
  UpdateMeditationCategorySchema,
  GetMeditationCategoriesSchema,
  GetSingleMeditationCategorySchema,
  CreateMeditationGoalSchema,
  UpdateMeditationGoalSchema,
  GetMeditationGoalsSchema,
  GetSingleMeditationGoalSchema,
  CreateMeditationInstructionSchema,
  UpdateMeditationInstructionSchema,
  GetMeditationInstructionsSchema,
  GetSingleMeditationInstructionSchema,
  GetInstructionsByResourceSchema,
} from "../validators/meditation.validators";
import { handlePrismaError, formatErrorResponse, asyncHandler } from "../../utils/error-handler";

const meditationAdminService = new MeditationAdminService();

// ====================================
//        MEDITATION RESOURCE CONTROLLERS
// ====================================

export const createMeditationResource = asyncHandler(async (request: NextRequest) => {
  const body = await request.json();
  console.log("📥 Request body:", body);
  
  console.log("🔍 Validating data...");
  const validatedData = CreateMeditationResourceSchema.parse(body);
  console.log("✅ Validated data:", validatedData);

  // Get user context from JWT/session (implement proper auth middleware)
  const userId = request.headers.get('x-user-id') || 'admin_user_id';
  const schoolId = request.headers.get('x-school-id') || undefined;

  // Add user context
  const contextData = {
    ...validatedData,
    schoolId,
    createdBy: userId,
  };

  const result = await meditationAdminService.createMeditationResource(contextData);

  if (result.success) {
    return NextResponse.json(result, { status: 201 });
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getMeditationResources = asyncHandler(async (request: NextRequest) => {
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
  
  const validatedData = GetMeditationResourcesSchema.parse(queryData);

  // Get user context from JWT/session
  const schoolId = request.headers.get('x-school-id') || undefined;

  // Add user context
  const contextData = {
    ...validatedData,
    schoolId,
  };

  const result = await meditationAdminService.getMeditationResources(contextData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getMeditationResourceById = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetSingleMeditationResourceSchema.parse(queryData);

  const result = await meditationAdminService.getMeditationResourceById(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const updateMeditationResource = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const { id, ...updateData } = await request.json();
  
  const validatedQuery = GetSingleMeditationResourceSchema.parse(queryData);
  const validatedData = UpdateMeditationResourceSchema.parse(updateData);

  // Get user context from JWT/session
  const schoolId = request.headers.get('x-school-id') || undefined;

  // Add user context
  const contextData = {
    id: validatedQuery.id,
    ...validatedData,
    schoolId,
  };

  const result = await meditationAdminService.updateMeditationResource(contextData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const deleteMeditationResource = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetSingleMeditationResourceSchema.parse(queryData);

  const result = await meditationAdminService.deleteMeditationResource(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

// ====================================
//        MEDITATION CATEGORY CONTROLLERS
// ====================================

export const createMeditationCategory = asyncHandler(async (request: NextRequest) => {
  const body = await request.json();
  const validatedData = CreateMeditationCategorySchema.parse(body);

  const result = await meditationAdminService.createMeditationCategory(validatedData);

  if (result.success) {
    return NextResponse.json(result, { status: 201 });
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getMeditationCategories = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetMeditationCategoriesSchema.parse(queryData);

  const result = await meditationAdminService.getMeditationCategories(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getMeditationCategoryById = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetSingleMeditationCategorySchema.parse(queryData);

  const result = await meditationAdminService.getMeditationCategoryById(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const updateMeditationCategory = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const { id, ...updateData } = await request.json();
  
  const validatedQuery = GetSingleMeditationCategorySchema.parse(queryData);
  const validatedData = UpdateMeditationCategorySchema.parse(updateData);

  const contextData = {
    id: validatedQuery.id,
    ...validatedData,
  };

  const result = await meditationAdminService.updateMeditationCategory(contextData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const deleteMeditationCategory = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetSingleMeditationCategorySchema.parse(queryData);

  const result = await meditationAdminService.deleteMeditationCategory(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

// ====================================
//           MEDITATION GOAL CONTROLLERS
// ====================================

export const createMeditationGoal = asyncHandler(async (request: NextRequest) => {
  const body = await request.json();
  const validatedData = CreateMeditationGoalSchema.parse(body);

  const result = await meditationAdminService.createMeditationGoal(validatedData);

  if (result.success) {
    return NextResponse.json(result, { status: 201 });
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getMeditationGoals = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetMeditationGoalsSchema.parse(queryData);

  const result = await meditationAdminService.getMeditationGoals(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getMeditationGoalById = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetSingleMeditationGoalSchema.parse(queryData);

  const result = await meditationAdminService.getMeditationGoalById(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const updateMeditationGoal = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const { id, ...updateData } = await request.json();
  
  const validatedQuery = GetSingleMeditationGoalSchema.parse(queryData);
  const validatedData = UpdateMeditationGoalSchema.parse(updateData);

  const contextData = {
    id: validatedQuery.id,
    ...validatedData,
  };

  const result = await meditationAdminService.updateMeditationGoal(contextData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const deleteMeditationGoal = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetSingleMeditationGoalSchema.parse(queryData);

  const result = await meditationAdminService.deleteMeditationGoal(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

// ====================================
//      MEDITATION INSTRUCTION CONTROLLERS
// ====================================

export const createMeditationInstruction = asyncHandler(async (request: NextRequest) => {
  const body = await request.json();
  const validatedData = CreateMeditationInstructionSchema.parse(body);

  // Get user context from JWT/session
  const userId = request.headers.get('x-user-id') || 'admin_user_id';
  const schoolId = request.headers.get('x-school-id') || undefined;

  // Add user context
  const contextData = {
    ...validatedData,
    schoolId,
    createdBy: userId,
  };

  const result = await meditationAdminService.createMeditationInstruction(contextData);

  if (result.success) {
    return NextResponse.json(result, { status: 201 });
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getMeditationInstructions = asyncHandler(async (request: NextRequest) => {
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
  
  const validatedData = GetMeditationInstructionsSchema.parse(queryData);

  // Get user context from JWT/session
  const schoolId = request.headers.get('x-school-id') || undefined;

  // Add user context
  const contextData = {
    ...validatedData,
    schoolId,
  };

  const result = await meditationAdminService.getMeditationInstructions(contextData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const getMeditationInstructionById = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  
  // Extract id from the URL path for dynamic routes
  const urlPath = request.url;
  const idMatch = urlPath.match(/\/api\/admin\/meditation\/instructions\/([^\/]+)/);
  const id = idMatch ? idMatch[1] : queryData.id;
  
  const validatedData = GetSingleMeditationInstructionSchema.parse({ id });

  const result = await meditationAdminService.getMeditationInstructionById(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const updateMeditationInstruction = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const { id, ...updateData } = await request.json();
  
  const validatedQuery = GetSingleMeditationInstructionSchema.parse(queryData);
  const validatedData = UpdateMeditationInstructionSchema.parse(updateData);

  const contextData = {
    id: validatedQuery.id,
    ...validatedData,
  };

  const result = await meditationAdminService.updateMeditationInstruction(contextData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const deleteMeditationInstruction = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  
  // Extract id from the URL path for dynamic routes
  const urlPath = request.url;
  const idMatch = urlPath.match(/\/api\/admin\/meditation\/instructions\/([^\/]+)/);
  const id = idMatch ? idMatch[1] : queryData.id;
  
  const validatedData = GetSingleMeditationInstructionSchema.parse({ id });

  const result = await meditationAdminService.deleteMeditationInstruction(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 404 });
  }
});

export const getInstructionsByResource = asyncHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  const validatedData = GetInstructionsByResourceSchema.parse(queryData);

  const result = await meditationAdminService.getInstructionsByResource(validatedData);

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});

export const deleteAllMeditationInstructions = asyncHandler(async (request: NextRequest) => {
  // Get user context from JWT/session
  const userId = request.headers.get('x-user-id') || 'admin_user_id';
  const schoolId = request.headers.get('x-school-id') || undefined;

  const result = await meditationAdminService.deleteAllMeditationInstructions();

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
});
