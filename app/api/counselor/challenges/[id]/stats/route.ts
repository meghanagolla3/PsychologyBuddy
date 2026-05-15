import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

export const GET = withPermission({
  module: 'CHALLENGES',
  action: 'VIEW',
})(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Challenge ID is required' }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        userChallenges: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                classRef: {
                  select: {
                    grade: true,
                    section: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!challenge) {
      return NextResponse.json({ success: false, message: 'Challenge not found' }, { status: 404 });
    }

    const stats = {
      assigned: challenge.userChallenges.length,
      completed: challenge.userChallenges.filter(uc => uc.status === 'COMPLETED').length,
      inProgress: challenge.userChallenges.filter(uc => uc.status === 'IN_PROGRESS' || uc.status === 'ASSIGNED').length,
    };

    const studentActivity = challenge.userChallenges.map(uc => ({
      name: `${uc.user.firstName} ${uc.user.lastName}`,
      className: uc.user.classRef ? `Class ${uc.user.classRef.grade}-${uc.user.classRef.section}` : 'N/A',
      status: uc.status === 'COMPLETED' ? 'Completed' : 'In progress'
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: challenge.id,
        title: challenge.name,
        category: challenge.category || 'General',
        startDate: challenge.startsAt.toISOString().split('T')[0],
        endDate: challenge.endsAt.toISOString().split('T')[0],
        createdBy: `${challenge.creator.firstName} ${challenge.creator.lastName}`,
        description: challenge.description,
        instructions: challenge.instructions,
        stats,
        students: studentActivity
      }
    });

  } catch (error) {
    console.error('Challenge Stats API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});
