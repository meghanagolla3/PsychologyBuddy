import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';
import { z } from 'zod';

// Validation schemas
const createChallengeSchema = z.object({
  name: z.string().min(1, "Challenge name is required"),
  description: z.string().min(1, "Description is required"),
  startsAt: z.string().transform((str) => new Date(str)).optional(),
  endsAt: z.string().transform((str) => new Date(str)).optional(),
  instructions: z.string().min(1, "Instructions are required"),
  requiresMeditation: z.boolean().default(false),
  requiresMusic: z.boolean().default(false),
  requiresPsychoeducation: z.boolean().default(false),
  requiresJournaling: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const updateChallengeSchema = createChallengeSchema.partial();

// GET - Fetch all challenges
export const GET = withPermission({
  module: 'CHALLENGES',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    console.log('Fetching challenges for admin:', user.id, 'role:', user.role.name, 'schoolId:', user.schoolId);

    let challenges: Awaited<ReturnType<typeof prisma.challenge.findMany>> & {
      creator: {
        firstName: string;
        lastName: string;
        role: {
          name: string;
        };
      };
      school?: {
        name: string;
      };
      _count: {
        userChallenges: number;
      };
    }[];

    // Check user role and schoolId to determine scope
    if (user.role.name === 'SUPERADMIN') {
      // Super Admin can see all challenges from all schools
      challenges = await prisma.challenge.findMany({
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
    } else if (user.role.name === 'SCHOOL_SUPERADMIN') {
      // School Super Admin can see all challenges from their school
      challenges = await prisma.challenge.findMany({
        where: {
          schoolId: user.schoolId,
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
    } else if (user.role.name === 'ADMIN') {
      // Regular Admin can see all challenges from their school
      challenges = await prisma.challenge.findMany({
        where: {
          schoolId: user.schoolId,
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
    } else {
      // Other roles (should not reach here due to permission check)
      challenges = [];
    }

    console.log('Admin - Found challenges:', challenges.length);
    console.log('Admin - User role:', user.role.name, 'schoolId:', user.schoolId);
    console.log('Admin - Challenges:', challenges.map(c => ({ id: c.id, name: c.name, schoolId: c.schoolId, schoolName: c.school?.name })));

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
      schoolName: challenge.school?.name || 'Unknown School',
      participantCount: challenge._count.userChallenges,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedChallenges,
      message: 'Challenges retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
});

// POST - Create new challenge
export const POST = withPermission({
  module: 'CHALLENGES',
  action: 'CREATE',
})(async (req: NextRequest, { user }: any) => {
  try {
    const body = await req.json();
    const validatedData = createChallengeSchema.parse(body);

    // Set schoolId based on user role
    let schoolId: string | undefined;
    if (user.role.name === 'SUPERADMIN') {
      // Super Admin can specify schoolId or it's optional
      schoolId = body.schoolId || undefined;
    } else {
      // School Super Admin and Regular Admin must use their own school
      schoolId = user.schoolId;
    }

    const challenge = await prisma.challenge.create({
      data: {
        ...validatedData,
        createdBy: user.id,
        schoolId,
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
        }
      }
    });

    const formattedChallenge = {
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
      schoolName: challenge.school?.name || 'Unknown School',
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedChallenge,
      message: 'Challenge created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating challenge:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create challenge' },
      { status: 500 }
    );
  }
});

// PUT - Update challenge
export const PUT = withPermission({
  module: 'CHALLENGES',
  action: 'UPDATE',
})(async (req: NextRequest, { user }: any) => {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    const validatedData = updateChallengeSchema.parse(updateData);

    // Check if challenge exists and user has permission
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
      select: { schoolId: true }
    });

    if (!existingChallenge) {
      return NextResponse.json(
        { success: false, message: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check permission based on role
    if (user.role.name === 'SUPERADMIN') {
      // Super Admin can edit all challenges
    } else if (existingChallenge.schoolId !== user.schoolId) {
      // School Super Admin and Regular Admin can only edit challenges from their school
      return NextResponse.json(
        { success: false, message: 'Permission denied - You can only edit challenges from your school' },
        { status: 403 }
      );
    }

    const challenge = await prisma.challenge.update({
      where: { id },
      data: validatedData,
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
        }
      }
    });

    const formattedChallenge = {
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
      schoolName: challenge.school?.name || 'Unknown School',
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedChallenge,
      message: 'Challenge updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating challenge:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update challenge' },
      { status: 500 }
    );
  }
});

// DELETE - Delete challenge
export const DELETE = withPermission({
  module: 'CHALLENGES',
  action: 'DELETE',
})(async (req: NextRequest, { user }: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Check if challenge exists and user has permission
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
      select: { schoolId: true }
    });

    if (!existingChallenge) {
      return NextResponse.json(
        { success: false, message: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check permission based on role
    if (user.role.name === 'SUPERADMIN') {
      // Super Admin can delete all challenges
    } else if (existingChallenge.schoolId !== user.schoolId) {
      // School Super Admin and Regular Admin can only delete challenges from their school
      return NextResponse.json(
        { success: false, message: 'Permission denied - You can only delete challenges from your school' },
        { status: 403 }
      );
    }

    await prisma.challenge.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Challenge deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete challenge' },
      { status: 500 }
    );
  }
});
