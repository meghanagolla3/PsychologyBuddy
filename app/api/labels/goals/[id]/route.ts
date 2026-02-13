import { NextRequest } from 'next/server';
import { GoalController } from '@/src/components/server/content/labels/goals/goal.controller';

// GET /api/goals/[id] - Get goal by ID (Admin & SuperAdmin)
export const GET = GoalController.getGoalById;

// PUT /api/goals/[id] - Update goal (Admin & SuperAdmin)
export const PUT = GoalController.updateGoal;

// DELETE /api/goals/[id] - Delete goal (Admin & SuperAdmin)
export const DELETE = GoalController.deleteGoal;
