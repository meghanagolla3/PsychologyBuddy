import prisma from '@/src/prisma';
import { AuthError } from '@/src/utils/errors';

export interface CreateBlockData {
  type: 'section' | 'image' | 'list' | 'takeaways' | 'reflection' | 'link' | 'divider';
  content: any;
  order?: number;
}

export interface UpdateBlockOrderData {
  blocks: Array<{
    id: string;
    order: number;
  }>;
}

export class ArticleBlockService {
  // Get all blocks for an article
  static async getBlocks(articleId: string) {
    try {
      const blocks = await prisma.articleBlock.findMany({
        where: { articleId },
        orderBy: { order: 'asc' },
      });

      return {
        success: true,
        message: 'Blocks retrieved successfully',
        data: blocks,
      };
    } catch (error) {
      console.error('Get blocks error:', error);
      throw new AuthError('Failed to retrieve blocks', 500);
    }
  }

  // Add a new block to an article
  static async addBlock(articleId: string, data: CreateBlockData) {
    try {
      // Get the highest order number for this article
      const lastBlock = await prisma.articleBlock.findFirst({
        where: { articleId },
        orderBy: { order: 'desc' },
      });

      const order = data.order ?? (lastBlock ? lastBlock.order + 1 : 0);

      const block = await prisma.articleBlock.create({
        data: {
          articleId,
          type: data.type,
          content: data.content,
          order,
        },
      });

      return {
        success: true,
        message: 'Block added successfully',
        data: block,
      };
    } catch (error: any) {
      console.error('Add block error:', error);
      throw new AuthError('Failed to add block', 500);
    }
  }

  // Update block order
  static async updateBlockOrder(articleId: string, blocks: UpdateBlockOrderData['blocks']) {
    try {
      // Update all blocks in a transaction
      await prisma.$transaction(
        blocks.map(({ id, order }) =>
          prisma.articleBlock.update({
            where: { id },
            data: { order },
          })
        )
      );

      return {
        success: true,
        message: 'Block order updated successfully',
        data: null,
      };
    } catch (error) {
      console.error('Update block order error:', error);
      throw new AuthError('Failed to update block order', 500);
    }
  }

  // Update a specific block
  static async updateBlock(blockId: string, data: Partial<CreateBlockData>) {
    try {
      const block = await prisma.articleBlock.update({
        where: { id: blockId },
        data: {
          ...(data.type && { type: data.type }),
          ...(data.content && { content: data.content }),
          ...(data.order !== undefined && { order: data.order }),
        },
      });

      return {
        success: true,
        message: 'Block updated successfully',
        data: block,
      };
    } catch (error) {
      console.error('Update block error:', error);
      throw new AuthError('Failed to update block', 500);
    }
  }

  // Delete a block
  static async deleteBlock(blockId: string) {
    try {
      await prisma.articleBlock.delete({
        where: { id: blockId },
      });

      return {
        success: true,
        message: 'Block deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete block error:', error);
      throw new AuthError('Failed to delete block', 500);
    }
  }
}
