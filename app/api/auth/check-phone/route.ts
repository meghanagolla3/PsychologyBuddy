import { NextRequest } from 'next/server';
import prisma from '@/src/prisma';

// GET /api/auth/check-phone - Check if phone already exists
// Query params: phone (required), excludeId (optional)
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const excludeId = searchParams.get('excludeId');

    if (!phone) {
      return Response.json(
        { error: { message: 'Phone is required', code: 400 } },
        { status: 400 }
      );
    }

    // Check if any user with this phone exists (excluding current user if excludeId provided)
    const whereClause: any = {
      phone: phone.trim(),
    };

    if (excludeId) {
      whereClause.id = {
        not: excludeId
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: whereClause,
      include: {
        role: {
          select: {
            name: true
          }
        }
      }
    });

    return Response.json({
      exists: !!existingUser,
      user: existingUser ? {
        id: existingUser.id,
        phone: existingUser.phone,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role?.name
      } : null
    });
  } catch (error) {
    console.error('Check phone error:', error);
    return Response.json(
      { error: { message: 'Internal server error', code: 500 } },
      { status: 500 }
    );
  }
};
