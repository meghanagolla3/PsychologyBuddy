import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/src/server/controllers/auth.controller';
import { ParentService } from '@/src/server/profiles/parent/parent.service';

// GET /api/parent/notifications - Get notifications for parent
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
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await ParentService.getNotifications(user.id, { unreadOnly, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get notifications' },
      { status: 500 }
    );
  }
};
