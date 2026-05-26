import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'ANALYTICS', // Bypassed by SuperAdmin
})(async (req: NextRequest, { user }: any) => {
  try {
    // Restrict access strictly to system SUPERADMINs
    if (user.role.name !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: SuperAdmin access only' },
        { status: 403 }
      );
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    console.error('[ContactAPI] Error fetching contact messages:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
