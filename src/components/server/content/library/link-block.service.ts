import { prisma } from './prisma';
import { AuthError } from '@/src/utils/errors';

export interface CreateLinkBlockData {
  title: string;
  url: string;
  description?: string;
  order?: number;
}

export interface UpdateLinkBlockData {
  title?: string;
  url?: string;
  description?: string;
  order?: number;
}

export class LinkBlockService {
  // Get all link blocks for an article
  static async getLinkBlocks(articleId: string) {
    try {
      const blocks = await prisma.linkBlock.findMany({
        where: { articleId },
        orderBy: { order: 'asc' },
      });

      return {
        success: true,
        message: 'Link blocks retrieved successfully',
        data: blocks,
      };
    } catch (error) {
      console.error('Get link blocks error:', error);
      throw new AuthError('Failed to retrieve link blocks', 500);
    }
  }

  // Create a new link block
  static async createLinkBlock(articleId: string, data: CreateLinkBlockData) {
    try {
      // Get the highest order number for this article
      const lastBlock = await prisma.linkBlock.findFirst({
        where: { articleId },
        orderBy: { order: 'desc' },
      });

      const order = data.order ?? (lastBlock ? lastBlock.order + 1 : 0);

      const block = await prisma.linkBlock.create({
        data: {
          articleId,
          title: data.title,
          url: data.url,
          description: data.description,
          order,
        },
      });

      return {
        success: true,
        message: 'Link block created successfully',
        data: block,
      };
    } catch (error: any) {
      console.error('Create link block error:', error);
      throw new AuthError('Failed to create link block', 500);
    }
  }

  // Update a link block
  static async updateLinkBlock(blockId: string, data: UpdateLinkBlockData) {
    try {
      const block = await prisma.linkBlock.update({
        where: { id: blockId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.url && { url: data.url }),
          ...(data.description && { description: data.description }),
          ...(data.order !== undefined && { order: data.order }),
        },
      });

      return {
        success: true,
        message: 'Link block updated successfully',
        data: block,
      };
    } catch (error) {
      console.error('Update link block error:', error);
      throw new AuthError('Failed to update link block', 500);
    }
  }

  // Delete a link block
  static async deleteLinkBlock(blockId: string) {
    try {
      await prisma.linkBlock.delete({
        where: { id: blockId },
      });

      return {
        success: true,
        message: 'Link block deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete link block error:', error);
      throw new AuthError('Failed to delete link block', 500);
    }
  }
}
