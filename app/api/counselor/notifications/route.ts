import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/prisma";
import { withPermission } from "@/src/middleware/permission.middleware";

// GET /api/counselor/notifications - Fetch counselor notifications
export const GET = withPermission({
  module: 'DASHBOARD',
  action: 'VIEW',
})(async (req: NextRequest, ctx: any) => {
  try {
    const user = ctx.user;
    if (!user) {
      throw new Error('User not found in context');
    }
    const counselorId = user.id;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const whereClause: any = { userId: counselorId };
    if (unreadOnly) {
      whereClause.read = false;
    }

    // Diagnostic log
    console.log('[CounselorNotificationsAPI] Available models:', Object.keys(prisma).filter(k => !k.startsWith('$') && typeof (prisma as any)[k] === 'object'));

    if (!(prisma as any).counselorNotification) {
       console.error('[CounselorNotificationsAPI] counselorNotification model missing!');
       throw new Error('counselorNotification model missing from Prisma instance');
    }

    const notifications = await (prisma as any).counselorNotification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    console.log(`[CounselorNotificationsAPI] Found ${notifications.length} notifications for counselor ${counselorId}`);

    const unreadCount = await (prisma as any).counselorNotification.count({
      where: { 
        userId: counselorId,
        read: false 
      }
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });

  } catch (error: any) {
    console.error('[CounselorNotificationsAPI] Error fetching notifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch notifications",
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
});

// POST /api/counselor/notifications/read - Mark notification as read
// This is normally in a separate file like app/api/counselor/notifications/[id]/read/route.ts
// but for simplicity I can put it here if I use a different path or just create the sub-routes.
