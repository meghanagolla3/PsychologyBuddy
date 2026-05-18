import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// Get Session Follow-up Report
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
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        report: true,
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
      data: session.report,
    });
  } catch (error: any) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
});
// Update/Save Session Report
export const PATCH = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'UPDATE',
})(async (req: NextRequest, { params, user, userSchoolId }: any) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { behavioralTags, summary, recommendations, notes } = body;

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
      include: { report: true }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // Upsert the report
    const report = await prisma.sessionReport.upsert({
      where: { sessionId: id },
      update: {
        behavioralTags: behavioralTags || [],
        summary: summary || '',
        recommendations: recommendations || [],
        notes: notes || '',
        updatedAt: new Date(),
      },
      create: {
        sessionId: id,
        behavioralTags: behavioralTags || [],
        summary: summary || '',
        recommendations: recommendations || [],
        notes: notes || '',
      },
    });

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update report data' },
      { status: 500 }
    );
  }
});
