import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/src/server/controllers/auth.controller';
import { ParentService } from '@/src/server/profiles/parent/parent.service';

// PATCH /api/parent/notifications/[id]/read - Mark notification as read
export const PATCH = async (req: NextRequest, { params }: any) => {
  try {
    // Get authenticated user
    const authResponse = await authController.me(req);
    const authData = await authResponse.json();

    if (!authData.success || !authData.data?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    const user = authData.data.user;
    const { id } = await params;
    const result = await ParentService.markAsRead(id, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark as read' },
      { status: 500 }
    );
  }
};
