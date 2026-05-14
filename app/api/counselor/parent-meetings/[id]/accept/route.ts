import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/src/server/controllers/auth.controller';
import prisma from '@/src/prisma';

// POST - Accept a parent meeting request
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
    
    console.log('Accept API - User result:', userResult);
    console.log('Accept API - User result success:', userResult.success);
    console.log('Accept API - User result data type:', typeof userResult.data);
    
    if (!userResult.success) {
      console.log('Accept API - No session found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    const user = userResult.data.user;
    console.log('Accept API - User:', user);
    console.log('Accept API - User.role:', user.role);
    console.log('Accept API - User.role.name:', user.role?.name);
    console.log('Accept API - typeof user.role:', typeof user.role);

    if (!user.role || user.role.name !== 'COUNSELOR') {
      console.log('Accept API - User role:', user.role?.name);
      return NextResponse.json(
        { success: false, message: 'Forbidden: Counselor access required' },
        { status: 403 }
      );
    }

    // Update meeting status to SCHEDULED (accepted)
    const meeting = await prisma.parentMeeting.update({
      where: { id },
      data: { 
        status: 'SCHEDULED',
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

    console.log('Meeting accepted:', meeting.id);

    return NextResponse.json({
      success: true,
      data: meeting,
      message: 'Meeting accepted successfully'
    });

  } catch (error: any) {
    console.error('Accept meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to accept meeting' },
      { status: 500 }
    );
  }
}
