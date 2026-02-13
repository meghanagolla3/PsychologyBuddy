import { prisma } from './prisma';
import { AuthError } from '@/src/utils/errors';

export interface CreateReflectionBlockData {
  heading: string;
  content: string;
  prompt?: string;
  order?: number;
}

export interface UpdateReflectionBlockData {
  heading?: string;
  content?: string;
  prompt?: string;
  order?: number;
}

export class ReflectionBlockService {
  // Get all reflection blocks for an article
  static async getReflectionBlocks(articleId: string) {
    try {
      const blocks = await prisma.reflectionBlock.findMany({
        where: { articleId },
        orderBy: { order: 'asc' },
      });

      return {
        success: true,
        message: 'Reflection blocks retrieved successfully',
        data: blocks,
      };
    } catch (error) {
      console.error('Get reflection blocks error:', error);
      throw new AuthError('Failed to retrieve reflection blocks', 500);
    }
  }

  // Create a new reflection block
  static async createReflectionBlock(articleId: string, data: CreateReflectionBlockData) {
    try {
      // Get the highest order number for this article
      const lastBlock = await prisma.reflectionBlock.findFirst({
        where: { articleId },
        orderBy: { order: 'desc' },
      });

      const order = data.order ?? (lastBlock ? lastBlock.order + 1 : 0);

      const block = await prisma.reflectionBlock.create({
        data: {
          articleId,
          heading: data.heading,
          content: data.content,
          prompt: data.prompt,
          order,
        },
      });

      return {
        success: true,
        message: 'Reflection block created successfully',
        data: block,
      };
    } catch (error: any) {
      console.error('Create reflection block error:', error);
      throw new AuthError('Failed to create reflection block', 500);
    }
  }

  // Update a reflection block
  static async updateReflectionBlock(blockId: string, data: UpdateReflectionBlockData) {
    try {
      const block = await prisma.reflectionBlock.update({
        where: { id: blockId },
        data: {
          ...(data.heading && { heading: data.heading }),
          ...(data.content && { content: data.content }),
          ...(data.prompt && { prompt: data.prompt }),
          ...(data.order !== undefined && { order: data.order }),
        },
      });

      return {
        success: true,
        message: 'Reflection block updated successfully',
        data: block,
      };
    } catch (error) {
      console.error('Update reflection block error:', error);
      throw new AuthError('Failed to update reflection block', 500);
    }
  }

  // Delete a reflection block
  static async deleteReflectionBlock(blockId: string) {
    try {
      await prisma.reflectionBlock.delete({
        where: { id: blockId },
      });

      return {
        success: true,
        message: 'Reflection block deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete reflection block error:', error);
      throw new AuthError('Failed to delete reflection block', 500);
    }
  }
}
