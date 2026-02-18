import { prisma } from './prisma';
import { AuthError } from '@/src/utils/errors';

export interface CreateKeyTakeawaysBlockData {
  title?: string;
  items: string[];
  order?: number;
}

export interface UpdateKeyTakeawaysBlockData {
  title?: string;
  items?: string[];
  order?: number;
}

export class KeyTakeawaysBlockService {
  // Get all key takeaways blocks for an article
  static async getKeyTakeawaysBlocks(articleId: string) {
    try {
      const blocks = await prisma.keyTakeawaysBlock.findMany({
        where: { articleId },
        orderBy: { order: 'asc' },
      });

      return {
        success: true,
        message: 'Key takeaways blocks retrieved successfully',
        data: blocks,
      };
    } catch (error) {
      console.error('Get key takeaways blocks error:', error);
      throw new AuthError('Failed to retrieve key takeaways blocks', 500);
    }
  }

  // Create a new key takeaways block
  static async createKeyTakeawaysBlock(articleId: string, data: CreateKeyTakeawaysBlockData) {
    try {
      // Get the highest order number for this article
      const lastBlock = await prisma.keyTakeawaysBlock.findFirst({
        where: { articleId },
        orderBy: { order: 'desc' },
      });

      const order = data.order ?? (lastBlock ? lastBlock.order + 1 : 0);

      const block = await prisma.keyTakeawaysBlock.create({
        data: {
          articleId,
          title: data.title,
          items: data.items,
          order,
        },
      });

      return {
        success: true,
        message: 'Key takeaways block created successfully',
        data: block,
      };
    } catch (error: any) {
      console.error('Create key takeaways block error:', error);
      throw new AuthError('Failed to create key takeaways block', 500);
    }
  }

  // Update a key takeaways block
  static async updateKeyTakeawaysBlock(blockId: string, data: UpdateKeyTakeawaysBlockData) {
    try {
      const block = await prisma.keyTakeawaysBlock.update({
        where: { id: blockId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.items && { items: data.items }),
          ...(data.order !== undefined && { order: data.order }),
        },
      });

      return {
        success: true,
        message: 'Key takeaways block updated successfully',
        data: block,
      };
    } catch (error) {
      console.error('Update key takeaways block error:', error);
      throw new AuthError('Failed to update key takeaways block', 500);
    }
  }

  // Delete a key takeaways block
  static async deleteKeyTakeawaysBlock(blockId: string) {
    try {
      await prisma.keyTakeawaysBlock.delete({
        where: { id: blockId },
      });

      return {
        success: true,
        message: 'Key takeaways block deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete key takeaways block error:', error);
      throw new AuthError('Failed to delete key takeaways block', 500);
    }
  }
}
