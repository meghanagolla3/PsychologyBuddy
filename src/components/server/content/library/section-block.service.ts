import prisma from '@/src/prisma';
import { AuthError } from '@/src/utils/errors';

export interface CreateSectionBlockData {
  title: string;
  content: string;
  order?: number;
}

export interface UpdateSectionBlockData {
  title?: string;
  content?: string;
  order?: number;
}

export class SectionBlockService {
  // Get all section blocks for an article
  static async getBlocks(articleId: string) {
    try {
      const blocks = await prisma.sectionBlock.findMany({
        where: { articleId },
        orderBy: { order: 'asc' },
      });

      return {
        success: true,
        message: 'Section blocks retrieved successfully',
        data: blocks,
      };
    } catch (error) {
      console.error('Get section blocks error:', error);
      throw new AuthError('Failed to retrieve section blocks', 500);
    }
  }

  // Add a new section block to an article
  static async addBlock(articleId: string, data: CreateSectionBlockData) {
    try {
      // Get the highest order number for this article
      const lastBlock = await prisma.sectionBlock.findFirst({
        where: { articleId },
        orderBy: { order: 'desc' },
      });

      const order = data.order ?? (lastBlock ? lastBlock.order + 1 : 0);

      const block = await prisma.sectionBlock.create({
        data: {
          articleId,
          title: data.title,
          content: data.content,
          order,
        },
      });

      return {
        success: true,
        message: 'Section block added successfully',
        data: block,
      };
    } catch (error: any) {
      console.error('Add section block error:', error);
      throw new AuthError('Failed to add section block', 500);
    }
  }

  // Update a section block
  static async updateBlock(blockId: string, data: UpdateSectionBlockData) {
    try {
      const block = await prisma.sectionBlock.update({
        where: { id: blockId },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.order !== undefined && { order: data.order }),
        },
      });

      return {
        success: true,
        message: 'Section block updated successfully',
        data: block,
      };
    } catch (error) {
      console.error('Update section block error:', error);
      throw new AuthError('Failed to update section block', 500);
    }
  }

  // Delete a section block
  static async deleteBlock(blockId: string) {
    try {
      await prisma.sectionBlock.delete({
        where: { id: blockId },
      });

      return {
        success: true,
        message: 'Section block deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete section block error:', error);
      throw new AuthError('Failed to delete section block', 500);
    }
  }
}
