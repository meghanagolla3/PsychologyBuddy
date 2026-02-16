import { NextRequest, NextResponse } from "next/server";
import { MusicAdminService } from "./music.admin.service";
import {
  CreateMusicResourceSchema,
  UpdateMusicResourceSchema,
  GetMusicResourcesSchema,
  GetSingleMusicResourceSchema,
  CreateMusicCategorySchema,
  UpdateMusicCategorySchema,
  GetMusicCategoriesSchema,
  GetSingleMusicCategorySchema,
  CreateMusicGoalSchema,
  UpdateMusicGoalSchema,
  GetMusicGoalsSchema,
  GetSingleMusicGoalSchema,
  CreateMusicInstructionSchema,
  UpdateMusicInstructionSchema,
  GetMusicInstructionsSchema,
  GetSingleMusicInstructionSchema,
  GetInstructionsByResourceSchema,
} from "./music.validators";

const musicAdminService = new MusicAdminService();

// ====================================
//        MUSIC RESOURCE CONTROLLERS
// ====================================

export async function createMusicResource(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', JSON.stringify(body, null, 2)); // Debug log
    
    const validatedData = CreateMusicResourceSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2)); // Debug log

    // Add user context (this would come from authentication middleware)
    const contextData = {
      ...validatedData,
      schoolId: "school_id", // This should come from user context
    };

    const result = await musicAdminService.createMusicResource(contextData);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function getMusicResources(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetMusicResourcesSchema.parse(queryData);

    // Add user context
    const contextData = {
      ...validatedData,
      schoolId: "school_id", // This should come from user context
    };

    const result = await musicAdminService.getMusicResources(contextData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function getMusicResourceById(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetSingleMusicResourceSchema.parse(queryData);

    const result = await musicAdminService.getMusicResourceById(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function updateMusicResource(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const { id, ...updateData } = await request.json();
    
    const validatedQuery = GetSingleMusicResourceSchema.parse(queryData);
    const validatedData = UpdateMusicResourceSchema.parse(updateData);

    // Add user context
    const contextData = {
      id: validatedQuery.id,
      ...validatedData,
      schoolId: "school_id", // This should come from user context
    };

    const result = await musicAdminService.updateMusicResource(contextData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function deleteMusicResource(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetSingleMusicResourceSchema.parse(queryData);

    const result = await musicAdminService.deleteMusicResource(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

// ====================================
//        MUSIC CATEGORY CONTROLLERS
// ====================================

export async function createMusicCategory(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateMusicCategorySchema.parse(body);

    const result = await musicAdminService.createMusicCategory(validatedData);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function getMusicCategories(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetMusicCategoriesSchema.parse(queryData);

    const result = await musicAdminService.getMusicCategories(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function getMusicCategoryById(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetSingleMusicCategorySchema.parse(queryData);

    const result = await musicAdminService.getMusicCategoryById(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function updateMusicCategory(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const { id, ...updateData } = await request.json();
    
    const validatedQuery = GetSingleMusicCategorySchema.parse(queryData);
    const validatedData = UpdateMusicCategorySchema.parse(updateData);

    const contextData = {
      id: validatedQuery.id,
      ...validatedData,
    };

    const result = await musicAdminService.updateMusicCategory(contextData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function deleteMusicCategory(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetSingleMusicCategorySchema.parse(queryData);

    const result = await musicAdminService.deleteMusicCategory(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

// ====================================
//           MUSIC GOAL CONTROLLERS
// ====================================

export async function createMusicGoal(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateMusicGoalSchema.parse(body);

    const result = await musicAdminService.createMusicGoal(validatedData);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function getMusicGoals(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetMusicGoalsSchema.parse(queryData);

    const result = await musicAdminService.getMusicGoals(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function getMusicGoalById(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetSingleMusicGoalSchema.parse(queryData);

    const result = await musicAdminService.getMusicGoalById(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function updateMusicGoal(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const { id, ...updateData } = await request.json();
    
    const validatedQuery = GetSingleMusicGoalSchema.parse(queryData);
    const validatedData = UpdateMusicGoalSchema.parse(updateData);

    const contextData = {
      id: validatedQuery.id,
      ...validatedData,
    };

    const result = await musicAdminService.updateMusicGoal(contextData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function deleteMusicGoal(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetSingleMusicGoalSchema.parse(queryData);

    const result = await musicAdminService.deleteMusicGoal(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

// ====================================
//      MUSIC INSTRUCTION CONTROLLERS
// ====================================

export async function createMusicInstruction(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateMusicInstructionSchema.parse(body);

    // Add user context
    const contextData = {
      ...validatedData,
      schoolId: "school_id", // This should come from user context
    };

    const result = await musicAdminService.createMusicInstruction(contextData);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function getMusicInstructions(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetMusicInstructionsSchema.parse(queryData);

    // Add user context
    const contextData = {
      ...validatedData,
      schoolId: "school_id", // This should come from user context
    };

    const result = await musicAdminService.getMusicInstructions(contextData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function getMusicInstructionById(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetSingleMusicInstructionSchema.parse(queryData);

    const result = await musicAdminService.getMusicInstructionById(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function updateMusicInstruction(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const { id, ...updateData } = await request.json();
    
    const validatedQuery = GetSingleMusicInstructionSchema.parse(queryData);
    const validatedData = UpdateMusicInstructionSchema.parse(updateData);

    const contextData = {
      id: validatedQuery.id,
      ...validatedData,
    };

    const result = await musicAdminService.updateMusicInstruction(contextData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function deleteMusicInstruction(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetSingleMusicInstructionSchema.parse(queryData);

    const result = await musicAdminService.deleteMusicInstruction(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function getInstructionsByResource(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams.entries());
    const validatedData = GetInstructionsByResourceSchema.parse(queryData);

    const result = await musicAdminService.getInstructionsByResource(validatedData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request parameters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
