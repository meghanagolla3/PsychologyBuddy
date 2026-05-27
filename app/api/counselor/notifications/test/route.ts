import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/prisma";
import { withPermission } from "@/src/middleware/permission.middleware";

export const POST = withPermission({
  module: 'DASHBOARD',
  action: 'VIEW',
})(async (req: NextRequest, ctx: any) => {
  try {
    const user = ctx.user;
    if (!user) {
      throw new Error('User not found in context');
    }
    const counselorId = user.id;

    const notification = await prisma.counselorNotification.create({
      data: {
        userId: counselorId,
        type: 'system',
        message: 'This is a test notification ' + new Date().toLocaleTimeString(),
        severity: 'low',
        read: false
      }
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('[CounselorNotificationsTestAPI] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
});

