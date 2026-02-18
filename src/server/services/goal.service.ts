import prisma from '@/src/prisma';
import { AuthError } from '@/src/utils/errors';
import { CreateGoalData, UpdateGoalData } from '../validators/goal.validators';

export class GoalService {
  // Create new goal
  static async createGoal(data: CreateGoalData) {
    try {
      // Check if goal with same name already exists
      const existingGoal = await prisma.goalLabel.findUnique({
        where: { name: data.name },
      });

      if (existingGoal) {
        throw AuthError.conflict('Goal with this name already exists');
      }

      const goal = await prisma.goalLabel.create({
        data: {
          name: data.name,
        },
      });

      return {
        success: true,
        message: 'Goal created successfully',
        data: goal,
      };
    } catch (error) {
      console.error('Create goal error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to create goal', 500);
    }
  }

  // Get all goals
  static async getAllGoals() {
    try {
      const goals = await prisma.goalLabel.findMany({
        orderBy: { name: 'asc' },
      });

      return {
        success: true,
        message: 'Goals retrieved successfully',
        data: goals,
      };
    } catch (error) {
      console.error('Get goals error:', error);
      throw new AuthError('Failed to retrieve goals', 500);
    }
  }

  // Get goal by ID
  static async getGoalById(id: string) {
    try {
      const goal = await prisma.goalLabel.findUnique({
        where: { id },
      });

      if (!goal) {
        throw AuthError.notFound('Goal not found');
      }

      return {
        success: true,
        message: 'Goal retrieved successfully',
        data: goal,
      };
    } catch (error) {
      console.error('Get goal error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to retrieve goal', 500);
    }
  }

  // Update goal
  static async updateGoal(id: string, data: UpdateGoalData) {
    try {
      // Check if goal exists
      const existingGoal = await prisma.goalLabel.findUnique({
        where: { id },
      });

      if (!existingGoal) {
        throw AuthError.notFound('Goal not found');
      }

      // If updating name, check for duplicates
      if (data.name && data.name !== existingGoal.name) {
        const duplicateGoal = await prisma.goalLabel.findUnique({
          where: { name: data.name },
        });

        if (duplicateGoal) {
          throw AuthError.conflict('Goal with this name already exists');
        }
      }

      const updateData: any = {};
      if (data.name) updateData.name = data.name;

      const goal = await prisma.goalLabel.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'Goal updated successfully',
        data: goal,
      };
    } catch (error) {
      console.error('Update goal error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to update goal', 500);
    }
  }

  // Delete goal
  static async deleteGoal(id: string) {
    try {
      // Check if goal exists
      const existingGoal = await prisma.goalLabel.findUnique({
        where: { id },
        include: {
          articles: {
            select: { id: true },
            take: 1, // Just check if there are any articles
          },
        },
      });

      if (!existingGoal) {
        throw AuthError.notFound('Goal not found');
      }

      // Check if goal is being used by any articles
      if (existingGoal.articles.length > 0) {
        throw new AuthError('Cannot delete goal that is being used by articles', 400);
      }

      // Delete goal
      await prisma.goalLabel.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Goal deleted successfully',
        data: { id },
      };
    } catch (error) {
      console.error('Delete goal error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to delete goal', 500);
    }
  }
}
