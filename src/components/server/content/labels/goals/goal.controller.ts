import { NextRequest, NextResponse } from 'next/server';
import { GoalService } from './goal.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import { CreateGoalSchema, UpdateGoalSchema } from './goal.validators';

export class GoalController {
  // GET /api/labels/goals - Get all goals (Admin & SuperAdmin)
  static getGoals = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest) => {
    try {
      const result = await GoalService.getAllGoals();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get goals error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/labels/goals - Create goal (Admin & SuperAdmin)
  static createGoal = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'CREATE' 
  })(async (req: NextRequest) => {
    try {
      let body;
      try {
        body = await req.json();
        console.log('Received goal data:', body);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new AuthError('Invalid JSON in request body', 400);
      }

      const validatedData = CreateGoalSchema.parse(body);
      
      const result = await GoalService.createGoal(validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Create goal error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/labels/goals/[id] - Get goal by ID (Admin & SuperAdmin)
  static getGoalById = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'VIEW' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const result = await GoalService.getGoalById(params.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get goal error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/labels/goals/[id] - Update goal (Admin & SuperAdmin)
  static updateGoal = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const body = await req.json();
      const validatedData = UpdateGoalSchema.parse(body);
      
      const result = await GoalService.updateGoal(params.id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update goal error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/labels/goals/[id] - Delete goal (Admin & SuperAdmin)
  static deleteGoal = withPermission({ 
    module: 'PSYCHO_EDUCATION', 
    action: 'DELETE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const result = await GoalService.deleteGoal(params.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete goal error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
