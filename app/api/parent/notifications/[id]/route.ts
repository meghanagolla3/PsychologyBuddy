import { NextRequest, NextResponse } from 'next/server';
import { authController } from '@/src/server/controllers/auth.controller';
import { ParentService } from '@/src/server/profiles/parent/parent.service';

// DELETE /api/parent/notifications/[id] - Delete notification
export const DELETE = async (req: NextRequest, { params }: any) => {
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
    const result = await ParentService.deleteNotification(id, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete notification' },
      { status: 500 }
    );
  }
};
