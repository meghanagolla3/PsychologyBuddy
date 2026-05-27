import { prisma } from './prisma';
import { AuthError } from '@/src/utils/errors';
import { uploadBase64ToS3, deleteFromS3 } from '@/src/utils/s3';

export interface CreateImageBlockData {
  src: string;
  altText?: string;
  caption?: string;
  order?: number;
}

export interface UpdateImageBlockData {
  src?: string;
  altText?: string;
  caption?: string;
  order?: number;
}

export class ImageBlockService {
  // Get all image blocks for an article
  static async getImageBlocks(articleId: string) {
    try {
      const blocks = await prisma.imageBlock.findMany({
        where: { articleId },
        orderBy: { order: 'asc' },
      });

      return {
        success: true,
        message: 'Image blocks retrieved successfully',
        data: blocks,
      };
    } catch (error) {
      console.error('Get image blocks error:', error);
      throw new AuthError('Failed to retrieve image blocks', 500);
    }
  }

  // Create a new image block
  static async createImageBlock(articleId: string, data: CreateImageBlockData) {
    try {
      // Get the highest order number for this article
      const lastBlock = await prisma.imageBlock.findFirst({
        where: { articleId },
        orderBy: { order: 'desc' },
      });

      const order = data.order ?? (lastBlock ? lastBlock.order + 1 : 0);

      if (data.src && data.src.startsWith('data:')) {
        data.src = await uploadBase64ToS3(data.src, `article_img_${articleId}_${Date.now()}`) || '';
      }

      const block = await prisma.imageBlock.create({
        data: {
          articleId,
          src: data.src,
          altText: data.altText,
          caption: data.caption,
          order,
        },
      });

      return {
        success: true,
        message: 'Image block created successfully',
        data: block,
      };
    } catch (error: any) {
      console.error('Create image block error:', error);
      throw new AuthError('Failed to create image block', 500);
    }
  }

  // Update an image block
  static async updateImageBlock(blockId: string, data: UpdateImageBlockData) {
    try {
      const existingBlock = await prisma.imageBlock.findUnique({
        where: { id: blockId }
      });

      if (!existingBlock) {
        throw new AuthError('Image block not found', 404);
      }

      if (data.src && data.src.startsWith('data:')) {
        const oldUrl = existingBlock.src;
        data.src = await uploadBase64ToS3(data.src, `article_img_${existingBlock.articleId}_${Date.now()}`) || '';
        if (oldUrl && (oldUrl.startsWith('http:') || oldUrl.startsWith('https:'))) {
          await deleteFromS3(oldUrl);
        }
      }

      const block = await prisma.imageBlock.update({
        where: { id: blockId },
        data: {
          ...(data.src && { src: data.src }),
          ...(data.altText && { altText: data.altText }),
          ...(data.caption && { caption: data.caption }),
          ...(data.order !== undefined && { order: data.order }),
        },
      });

      return {
        success: true,
        message: 'Image block updated successfully',
        data: block,
      };
    } catch (error) {
      console.error('Update image block error:', error);
      if (error instanceof AuthError) throw error;
      throw new AuthError('Failed to update image block', 500);
    }
  }

  // Delete an image block
  static async deleteImageBlock(blockId: string) {
    try {
      const existingBlock = await prisma.imageBlock.findUnique({
        where: { id: blockId }
      });

      if (existingBlock && existingBlock.src && (existingBlock.src.startsWith('http:') || existingBlock.src.startsWith('https:'))) {
        await deleteFromS3(existingBlock.src);
      }

      await prisma.imageBlock.delete({
        where: { id: blockId },
      });

      return {
        success: true,
        message: 'Image block deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Delete image block error:', error);
      throw new AuthError('Failed to delete image block', 500);
    }
  }
}

