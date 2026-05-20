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
    const { id } = await req.json();

    if (id) {
      await (prisma as any).counselorNotification.update({
        where: { id, userId: counselorId },
        data: { 
          read: true,
          readAt: new Date()
        }
      });
    } else {
      await (prisma as any).counselorNotification.updateMany({
        where: { userId: counselorId, read: false },
        data: { 
          read: true,
          readAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CounselorNotificationsReadAPI] Error:', error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
});
