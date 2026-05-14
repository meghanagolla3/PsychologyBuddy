import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const PUT = withPermission({
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

    // Get meeting details
    const meeting = await prisma.parentMeeting.findFirst({
      where: {
        id: id,
        counselorId: userInfo.id,
        schoolId: userInfo.schoolId,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Update meeting status to COMPLETED
    const updatedMeeting = await prisma.parentMeeting.update({
      where: { id: id },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      data: updatedMeeting,
      message: 'Meeting completed successfully',
    });
  } catch (error: any) {
    console.error('Complete meeting error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete meeting' },
      { status: 500 }
    );
  }
});
