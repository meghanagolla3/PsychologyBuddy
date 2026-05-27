import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/src/server/controllers/auth.controller';
import { ParentService } from '@/src/server/profiles/parent/parent.service';

// GET /api/parent/notifications/unread-count - Get unread notification count
export const GET = async (req: NextRequest) => {
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
    const result = await ParentService.getUnreadCount(user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get unread count error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get unread count' },
      { status: 500 }
    );
  }
};

