import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// GET - Fetch all challenges for counselors (including super admin challenges)
export const GET = withPermission({
  module: 'CHALLENGES',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    console.log('Fetching all challenges for counselor:', user.id, 'schoolId:', user.schoolId);

    // Counselors can see:
    // 1. Challenges created by Super Admin (no schoolId) - Global challenges
    // 2. Challenges created by their school admins/counselors (same schoolId)
    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { schoolId: user.schoolId }, // Challenges from their school
          { schoolId: null }, // Super Admin challenges with no school (Global)
        ]
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            role: {
              select: {
                name: true,
              }
            }
          }
        },
        school: {
          select: {
            name: true,
          }
        },
        _count: {
          select: {
            userChallenges: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Counselor - Found challenges:', challenges.length);
    console.log('Counselor - User schoolId:', user.schoolId);
    console.log('Counselor - Challenges:', challenges.map(c => ({ id: c.id, name: c.name, schoolId: c.schoolId, schoolName: c.school?.name })));

    const formattedChallenges = challenges.map((challenge) => ({
      id: challenge.id,
      name: challenge.name,
      category: challenge.category,
      description: challenge.description,
      startsAt: challenge.startsAt,
      endsAt: challenge.endsAt,
      instructions: challenge.instructions,
      isActive: challenge.isActive,
      requiresMeditation: challenge.requiresMeditation,
      requiresMusic: challenge.requiresMusic,
      requiresPsychoeducation: challenge.requiresPsychoeducation,
      requiresJournaling: challenge.requiresJournaling,
      createdBy: `${challenge.creator.firstName} ${challenge.creator.lastName}`,
      creatorRole: challenge.creator.role.name,
      schoolId: challenge.schoolId,
      schoolName: challenge.school?.name || 'Global',
      participantCount: challenge._count.userChallenges,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedChallenges,
      message: 'All challenges retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching all challenges:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
});

