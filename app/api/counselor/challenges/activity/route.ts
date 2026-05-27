import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'CHALLENGES',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    const counselorId = user?.id;

    // Fetch user challenges with related data
    const activities = await prisma.userChallenge.findMany({
      where: {
        challenge: {
          isActive: true,
          // If counselor, maybe filter by counselor's school?
          // For now, let's get all related to the challenges they can see
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
            classRef: {
              select: {
                grade: true,
                section: true
              }
            }
          }
        },
        challenge: {
          select: {
            id: true,
            name: true,
            startsAt: true,
            endsAt: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      },
      take: 20
    });

    const formattedActivities = activities.map(activity => {
      const durationDays = Math.ceil((activity.challenge.endsAt.getTime() - activity.challenge.startsAt.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: activity.id,
        studentName: `${activity.user.firstName} ${activity.user.lastName}`,
        studentId: activity.user.studentId || 'N/A',
        className: activity.user.classRef ? `Class ${activity.user.classRef.grade}-${activity.user.classRef.section}` : 'N/A',
        challengeName: activity.challenge.name,
        challengeId: activity.challenge.id,
        status: activity.status, // COMPLETED, EXPIRED, etc.
        duration: `${durationDays} days`,
        timestamp: activity.completedAt || activity.assignedAt,
        updatedAt: activity.assignedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedActivities
    });

  } catch (error) {
    console.error('Challenge Activity API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});

