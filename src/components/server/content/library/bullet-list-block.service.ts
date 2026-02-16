import prisma from '@/src/prisma';
import { AuthError } from '@/src/utils/errors';

export interface CreateBulletListBlockData {
  title: string;
  items: string[];
  order?: number;
}

export interface UpdateBulletListBlockData {
  title?: string;
  items?: string[];
  order?: number;
}

export class BulletListBlockService {
  // Get all bullet-list blocks for an article
  static async getBlocks(articleId: string) {
    try {
      const blocks = await prisma.bulletListBlock.findMany({
        where: { articleId },
        orderBy: { order: 'asc' },
      });

      return {
        success: true,
        message: 'Bullet-list blocks retrieved successfully',
        data: blocks,
      };
    } catch (error) {
      console.error('Get bullet-list blocks error:', error);
      throw new AuthError('Failed to retrieve bullet-list blocks', 500);
    }
  }

  // Add a new bullet-list block to an article
  static async addBlock(articleId: string, data: CreateBulletListBlockData) {
    try {
      // Get the highest order number for this article
      const lastBlock = await prisma.bulletListBlock.findFirst({
        where: { articleId },
        orderBy: { order: 'desc' },
      });

      const order = data.order ?? (lastBlock ? lastBlock.order + 1 : 0);

      const block = await prisma.bulletListBlock.create({
        data: {
          articleId,
          title: data.title,
          items: data.items,
          order,
        },
      });

      return {
        success: true,
        message: 'Bullet-list block added successfully',
        data: block,
      };
    } catch (error: any) {
      console.error('Add bullet-list block error:', error);
      throw new AuthError('Failed to add bullet-list block', 500);
    }
  }

  // Update a bullet-list block
  static async updateBlock(blockId: string, data: UpdateBulletListBlockData) {
    try {
      const block = await prisma.bulletListBlock.update({
        where: { id: blockId },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.items !== undefined && { items: data.items }),
          ...(data.order !== undefined && { order: data.order }),
        },
      });

      return {
        success: true,
        message: 'Bullet-list block updated successfully',
        data: block,
      };
    } catch (error) {
      console.error('Update bullet-list block error:', error);
      throw new AuthError('Failed to update bullet-list block', 500);
    }
  }

  // Delete a bullet-list block
  static async deleteBlock(blockId: string) {
    try {
      await prisma.bulletListBlock.delete({
        where: { id: blockId },
      });

      return {
        success: true,
        message: 'Bullet-list block deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete bullet-list block error:', error);
      throw new AuthError('Failed to delete bullet-list block', 500);
    }
  }
}
