import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { BadgeService } from './badge.service';
import { z } from 'zod';
import prisma from '@/src/prisma';

export class BadgeAdminController {
  async createBadge(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'badges.assign');

      const body = await req.json();
      const parsed = z.object({
        name: z.string().min(1, 'Name is required'),
        icon: z.string().min(1, 'Icon is required'),
        description: z.string().min(1, 'Description is required'),
        requirement: z.string().min(1, 'Requirement is required'),
        type: z.enum(['STREAK', 'JOURNAL_COUNT', 'ARTICLE_READ', 'MEDITATION_COUNT', 'MUSIC_COUNT', 'MOOD_CHECKIN']),
        conditionValue: z.number().min(1, 'Condition value must be at least 1').optional(),
        isActive: z.boolean().default(true),
      }).parse(body);

      const badge = await prisma.badge.create({
        data: {
          ...parsed,
          createdBy: session.userId,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Badge created successfully',
        data: badge,
      });
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async getBadges(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'badges.view');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.enum(['STREAK', 'JOURNAL_COUNT', 'ARTICLE_READ', 'MEDITATION_COUNT', 'MUSIC_COUNT', 'MOOD_CHECKIN']).optional(),
        isActive: z.coerce.boolean().optional(),
      }).parse({
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 20,
        search: searchParams.get('search') || undefined,
        type: searchParams.get('type') || undefined,
        isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      });

      const where: any = {};

      if (parsed.search) {
        where.OR = [
          { name: { contains: parsed.search, mode: 'insensitive' } },
          { description: { contains: parsed.search, mode: 'insensitive' } },
        ];
      }

      if (parsed.type) {
        where.type = parsed.type;
      }

      if (parsed.isActive !== undefined) {
        where.isActive = parsed.isActive;
      }

      const skip = (parsed.page - 1) * parsed.limit;

      const [badges, total] = await Promise.all([
        prisma.badge.findMany({
          where,
          skip,
          take: parsed.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        prisma.badge.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Badges retrieved successfully',
        data: {
          badges,
          pagination: {
            page: parsed.page,
            limit: parsed.limit,
            total,
            totalPages: Math.ceil(total / parsed.limit),
          },
        },
      });
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async updateBadge(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'badges.assign');

      const { searchParams } = new URL(req.url);
      const body = await req.json();
      
      const parsed = z.object({
        id: z.string().min(1, 'Badge ID is required'),
        name: z.string().min(1, 'Name is required').optional(),
        icon: z.string().min(1, 'Icon is required').optional(),
        description: z.string().min(1, 'Description is required').optional(),
        requirement: z.string().min(1, 'Requirement is required').optional(),
        type: z.enum(['STREAK', 'JOURNAL_COUNT', 'ARTICLE_READ', 'MEDITATION_COUNT', 'MUSIC_COUNT', 'MOOD_CHECKIN']).optional(),
        conditionValue: z.number().min(1, 'Condition value must be at least 1').optional(),
        isActive: z.boolean().optional(),
      }).parse({
        ...body,
        id: searchParams.get('id'),
      });

      const badge = await prisma.badge.update({
        where: { id: parsed.id },
        data: {
          name: parsed.name,
          icon: parsed.icon,
          description: parsed.description,
          requirement: parsed.requirement,
          type: parsed.type,
          conditionValue: parsed.conditionValue,
          isActive: parsed.isActive,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Badge updated successfully',
        data: badge,
      });
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  async deleteBadge(req: NextRequest) {
    try {
      const session = await requirePermission(req, 'badges.assign');

      const { searchParams } = new URL(req.url);
      const parsed = z.object({
        id: z.string().min(1, 'Badge ID is required'),
      }).parse({
        id: searchParams.get('id'),
      });

      // Check if badge exists
      const existingBadge = await prisma.badge.findUnique({
        where: { id: parsed.id },
      });

      if (!existingBadge) {
        return NextResponse.json({
          success: false,
          error: {
            code: 404,
            message: 'Badge not found',
          },
        }, { status: 404 });
      }

      await prisma.badge.delete({
        where: { id: parsed.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Badge deleted successfully',
      });
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }
}
