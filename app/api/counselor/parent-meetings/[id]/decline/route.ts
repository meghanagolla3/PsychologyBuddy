import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/src/server/controllers/auth.controller';
import prisma from '@/src/prisma';

// POST - Decline a parent meeting request
export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user using custom auth system
    const userResponse = await authController.me(req);
    const userResult = await userResponse.json();
    
    console.log('Decline API - User result:', userResult);
    
    if (!userResult.success) {
      console.log('Decline API - No session found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    const user = userResult.data.user;
    console.log('Decline API - User:', user);

    if (!user.role || user.role.name !== 'COUNSELOR') {
      console.log('Decline API - User role:', user.role?.name);
      return NextResponse.json(
        { success: false, message: 'Forbidden: Counselor access required' },
        { status: 403 }
      );
    }

    // Update meeting status to CANCELLED (declined)
    const meeting = await prisma.parentMeeting.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        updatedAt: new Date()
      },
      include: {
        student: {
          include: {
            parent: true
          }
        },
        counselor: true
      }
    });

    console.log('Meeting declined:', meeting.id);

    return NextResponse.json({
      success: true,
      data: meeting,
      message: 'Meeting declined successfully'
    });

  } catch (error: any) {
    console.error('Decline meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to decline meeting' },
      { status: 500 }
    );
  }
}
