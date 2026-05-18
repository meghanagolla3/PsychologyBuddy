import { NextRequest } from 'next/server';
import prisma from '@/src/prisma';

// GET /api/auth/check-email - Check if email already exists
// Query params: email (required), excludeId (optional)
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const excludeId = searchParams.get('excludeId');

    if (!email) {
      return Response.json(
        { error: { message: 'Email is required', code: 400 } },
        { status: 400 }
      );
    }

    // Check if any user with this email exists (excluding current user if excludeId provided)
    const whereClause: any = {
      email: email.toLowerCase().trim(),
    };

    if (excludeId) {
      whereClause.id = {
        not: excludeId
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: whereClause,
      include: {
        role: true
      }
    });

    return Response.json({
      exists: !!existingUser,
      user: existingUser ? {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role?.name
      } : null
    });
  } catch (error) {
    console.error('Check email error:', error);
    return Response.json(
      { error: { message: 'Internal server error', code: 500 } },
      { status: 500 }
    );
  }
};
