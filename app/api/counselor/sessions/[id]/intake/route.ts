import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// Get Session Intake Data
export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { params, user, userSchoolId }: any) => {
  try {
    const { id } = await params;

    const isSuperAdmin = user.role?.name === 'SUPERADMIN';
    const isAdmin = user.role?.name === 'ADMIN' || user.role?.name === 'SCHOOL_SUPERADMIN';
    const schoolId = userSchoolId || user.schoolId;

    if (!user.id || (!schoolId && !isSuperAdmin)) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    // Check if session exists and belongs to user's school
    const where: any = { id };
    if (!isSuperAdmin) {
      where.schoolId = schoolId;
      if (!isAdmin) {
        where.counselorId = user.id;
      }
    }

    const session = await prisma.counselingSession.findFirst({
      where,
      include: {
        intake: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session.intake,
    });
  } catch (error: any) {
    console.error('Get intake error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch intake data' },
      { status: 500 }
    );
  }
});

// Update/Save Session Intake
export const POST = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'UPDATE',
})(async (req: NextRequest, { params, user, userSchoolId }: any) => {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const isSuperAdmin = user.role?.name === 'SUPERADMIN';
    const isAdmin = user.role?.name === 'ADMIN' || user.role?.name === 'SCHOOL_SUPERADMIN';
    const schoolId = userSchoolId || user.schoolId;

    if (!user.id || (!schoolId && !isSuperAdmin)) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Check access
    const where: any = { id };
    if (!isSuperAdmin) {
      where.schoolId = schoolId;
      if (!isAdmin) {
        where.counselorId = user.id;
      }
    }

    const session = await prisma.counselingSession.findFirst({
      where,
      include: { intake: true }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // Upsert the intake data
    const intake = await prisma.sessionIntake.upsert({
      where: { sessionId: id },
      update: {
        data: body,
        updatedAt: new Date(),
      },
      create: {
        sessionId: id,
        data: body,
      },
    });

    // If the intake is being completed, update session status
    if (body.status === 'COMPLETED') {
      await prisma.counselingSession.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });
    }

    return NextResponse.json({
      success: true,
      data: intake,
    });
  } catch (error: any) {
    console.error('Update intake error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update intake data' },
      { status: 500 }
    );
  }
});
