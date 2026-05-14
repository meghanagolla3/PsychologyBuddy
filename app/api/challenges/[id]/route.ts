import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// GET - Get single challenge by ID
export const GET = withPermission({
  module: 'ADMIN',
  action: 'VIEW',
})(async (req: NextRequest, { user, params }: any) => {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    let challenge;

    // Check user role and schoolId to determine scope
    if (user.role.name === 'SUPER_ADMIN') {
      // Super Admin can see any challenge from any school
      challenge = await prisma.challenge.findUnique({
        where: { id },
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
          userChallenges: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  studentProfile: {
                    select: {
                      classRef: {
                        select: {
                          grade: true,
                          section: true,
                        }
                      }
                    }
                  }
                }
              }
            },
            orderBy: {
              startedAt: 'desc'
            }
          }
        }
      });
    } else if (user.role.name === 'SCHOOL_SUPERADMIN' || user.role.name === 'ADMIN' || user.role.name === 'COUNSELOR') {
      // School Super Admin, Regular Admin, and Counselor can only see challenges from their school
      challenge = await prisma.challenge.findUnique({
        where: { 
          id,
          schoolId: user.schoolId 
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
          userChallenges: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  studentProfile: {
                    select: {
                      classRef: {
                        select: {
                          grade: true,
                          section: true,
                        }
                      }
                    }
                  }
                }
              }
            },
            orderBy: {
              startedAt: 'desc'
            }
          }
        }
      });
    } else {
      // Other roles (should not reach here due to permission check)
      challenge = null;
    }

    if (!challenge) {
      return NextResponse.json(
        { success: false, message: 'Challenge not found' },
        { status: 404 }
      );
    }

    const formattedChallenge = {
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      dateTime: challenge.dateTime,
      instructions: challenge.instructions,
      isActive: challenge.isActive,
      requiresMeditation: challenge.requiresMeditation,
      requiresMusic: challenge.requiresMusic,
      requiresPsychoeducation: challenge.requiresPsychoeducation,
      requiresJournaling: challenge.requiresJournaling,
      createdBy: `${challenge.creator.firstName} ${challenge.creator.lastName}`,
      creatorRole: challenge.creator.role.name,
      schoolName: challenge.school?.name || 'Unknown School',
      participantCount: challenge.userChallenges.length,
      participants: challenge.userChallenges.map((uc: any) => ({
        id: uc.id,
        userId: uc.userId,
        userName: `${uc.user.firstName} ${uc.user.lastName}`,
        userClass: uc.user.studentProfile?.classRef 
          ? `Class ${uc.user.studentProfile.classRef.grade}-${uc.user.studentProfile.classRef.section}`
          : 'N/A',
        status: uc.status,
        startedAt: uc.startedAt,
        completedAt: uc.completedAt,
      })),
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedChallenge,
      message: 'Challenge retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
});
