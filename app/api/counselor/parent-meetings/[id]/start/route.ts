import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// PATCH - Start a parent meeting (move to PENDING status)
export const PATCH = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'UPDATE',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    const userInfo = {
      id: user?.id,
      role: user?.role?.name,
      schoolId: user?.schoolId,
    };
    
    if (!userInfo.id || !userInfo.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    // Update meeting status to PENDING
    const meeting = await prisma.parentMeeting.update({
      where: {
        id: id,
        counselorId: userInfo.id,
        schoolId: userInfo.schoolId,
      },
      data: {
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: meeting,
      message: 'Meeting started successfully',
    });
  } catch (error: any) {
    console.error('Start parent meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start meeting' },
      { status: 500 }
    );
  }
});
