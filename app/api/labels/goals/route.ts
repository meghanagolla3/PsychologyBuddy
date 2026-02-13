import { NextRequest } from 'next/server';
import { GoalController } from '@/src/components/server/content/labels/goals/goal.controller';

// GET /api/goals - Get all goals (Admin & SuperAdmin)
export const GET = GoalController.getGoals;

// POST /api/goals - Create goal (Admin & SuperAdmin)
export const POST = GoalController.createGoal;
