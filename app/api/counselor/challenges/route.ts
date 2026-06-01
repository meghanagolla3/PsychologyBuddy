import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';
import { z } from 'zod';

// Validation schemas
const createChallengeSchema = z.object({
  name: z.string().min(1, "Challenge name is required"),
  description: z.string().min(1, "Description is required"),
  startsAt: z.string().transform((str) => new Date(str)),
  endsAt: z.string().transform((str) => new Date(str)),
  instructions: z.string().min(1, "Instructions are required"),
  requiresMeditation: z.boolean().default(false),
  requiresMusic: z.boolean().default(false),
  requiresPsychoeducation: z.boolean().default(false),
  requiresJournaling: z.boolean().default(false),
  category: z.string().optional(),
  assignmentType: z.enum(["INDIVIDUAL", "CLASS", "SCHOOL"]).default("INDIVIDUAL"),
  targetClassId: z.string().optional(),
  targetSchoolId: z.string().optional(),
  targetValue: z.number().default(1),
  targetUnit: z.string().default("ENTRIES"),
  challengeType: z.string().default("DAILY"),
  moduleType: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET - Fetch all challenges for counselor
export const GET = withPermission({
  module: 'CHALLENGES',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    console.log('Fetching challenges for counselor:', user.id, 'schoolId:', user.schoolId);

    // Counselors can only see challenges from their school
    const challenges = await prisma.challenge.findMany({
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

    const formattedChallenges = challenges.map((challenge) => ({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      startsAt: challenge.startsAt,
      endsAt: challenge.endsAt,
      instructions: challenge.instructions,
      isActive: challenge.isActive,
      requiresMeditation: challenge.requiresMeditation,
      requiresMusic: challenge.requiresMusic,
      requiresPsychoeducation: challenge.requiresPsychoeducation,
      requiresJournaling: challenge.requiresJournaling,
      category: challenge.category,
      assignmentType: challenge.assignmentType,
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

// POST - Create new challenge (counselor)
export const POST = withPermission({
  module: 'CHALLENGES',
  action: 'CREATE',
})(async (req: NextRequest, { user }: any) => {
  try {
    const body = await req.json();
    const validatedData = createChallengeSchema.parse(body);

    const challenge = await prisma.challenge.create({
      data: {
        ...validatedData,
        createdBy: user.id,
        schoolId: user.schoolId,
      } as any,
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
      description: challenge.description,
      startsAt: challenge.startsAt,
      endsAt: challenge.endsAt,
      instructions: challenge.instructions,
      isActive: challenge.isActive,
      requiresMeditation: challenge.requiresMeditation,
      requiresMusic: challenge.requiresMusic,
      requiresPsychoeducation: challenge.requiresPsychoeducation,
      requiresJournaling: challenge.requiresJournaling,
      category: challenge.category,
      assignmentType: challenge.assignmentType,
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
        { success: false, message: 'Validation error', errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create challenge' },
      { status: 500 }
    );
  }
});

