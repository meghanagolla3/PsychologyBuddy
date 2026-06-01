import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';
import { z } from 'zod';

// Validation schema for challenge assignment
const assignChallengeSchema = z.object({
  challengeId: z.string().uuid("Invalid challenge ID"),
  assignmentType: z.enum(["INDIVIDUAL", "CLASS", "SCHOOL"]),
  targetUserId: z.string().uuid().optional(),
  targetClassId: z.string().uuid().optional(),
  targetSchoolId: z.string().uuid().optional(),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
}).refine((data) => {
  // Validate that exactly one target is specified based on assignment type
  if (data.assignmentType === "INDIVIDUAL" && !data.targetUserId) {
    return false;
  }
  if (data.assignmentType === "CLASS" && !data.targetClassId) {
    return false;
  }
  if (data.assignmentType === "SCHOOL" && !data.targetSchoolId) {
    return false;
  }
  return true;
}, {
  message: "Target must be specified based on assignment type"
}).refine((data) => {
  // Validate date range
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start < end;
}, {
  message: "End date must be after start date"
});

// POST - Assign challenge to students/class/school
export const POST = withPermission({
  module: 'CHALLENGES',
  action: 'CREATE',
})(async (req: NextRequest, { user }: any) => {
  try {
    const body = await req.json();
    console.log('Assigning challenge:', { body, user: user.id });

    // Validate request body
    const validatedData = assignChallengeSchema.parse(body);
    
    // Verify challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id: validatedData.challengeId }
    });

    if (!challenge) {
      console.error('Challenge not found:', validatedData.challengeId);
      return NextResponse.json(
        { error: 'Challenge not found', details: `No challenge exists with ID: ${validatedData.challengeId}` },
        { status: 404 }
      );
    }

    // Create challenge assignment record
    const assignment = await prisma.challengeAssignment.create({
      data: {
        challengeId: validatedData.challengeId,
        assignedBy: user.id,
        assignmentType: validatedData.assignmentType,
        targetUserId: validatedData.targetUserId,
        targetClassId: validatedData.targetClassId,
        targetSchoolId: validatedData.targetSchoolId,
        assignedAt: new Date(),
      }
    });

    console.log('Challenge assignment created:', assignment);

    // Create user challenge records based on assignment type
    let userChallenges = [];
    
    if (validatedData.assignmentType === "INDIVIDUAL") {
      // Assign to specific user (use upsert to handle existing assignments)
      const userChallenge = await prisma.userChallenge.upsert({
        where: {
          userId_challengeId: {
            userId: validatedData.targetUserId!,
            challengeId: validatedData.challengeId
          }
        },
        update: {
          assignedAt: new Date(validatedData.startDate),
          status: "ASSIGNED",
          progressPercentage: 0,
        },
        create: {
          userId: validatedData.targetUserId!,
          challengeId: validatedData.challengeId,
          assignedAt: new Date(validatedData.startDate),
          status: "ASSIGNED",
          progressPercentage: 0,
        }
      });
      userChallenges.push(userChallenge);
      
    } else if (validatedData.assignmentType === "CLASS") {
      // Assign to all students in the class
      const studentsInClass = await prisma.user.findMany({
        where: {
          classId: validatedData.targetClassId,
          status: "ACTIVE",
          studentId: {
            not: null
          }
        },
        select: { id: true }
      });

      userChallenges = await Promise.all(
        studentsInClass.map(student =>
          prisma.userChallenge.upsert({
            where: {
              userId_challengeId: {
                userId: student.id,
                challengeId: validatedData.challengeId
              }
            },
            update: {
              assignedAt: new Date(validatedData.startDate),
              status: "ASSIGNED",
              progressPercentage: 0,
            },
            create: {
              userId: student.id,
              challengeId: validatedData.challengeId,
              assignedAt: new Date(validatedData.startDate),
              status: "ASSIGNED",
              progressPercentage: 0,
            }
          })
        )
      );
      
    } else if (validatedData.assignmentType === "SCHOOL") {
      // Assign to all students in the school
      const studentsInSchool = await prisma.user.findMany({
        where: {
          schoolId: validatedData.targetSchoolId,
          status: "ACTIVE",
          studentId: {
            not: null
          }
        },
        select: { id: true }
      });

      userChallenges = await Promise.all(
        studentsInSchool.map(student =>
          prisma.userChallenge.upsert({
            where: {
              userId_challengeId: {
                userId: student.id,
                challengeId: validatedData.challengeId
              }
            },
            update: {
              assignedAt: new Date(validatedData.startDate),
              status: "ASSIGNED",
              progressPercentage: 0,
            },
            create: {
              userId: student.id,
              challengeId: validatedData.challengeId,
              assignedAt: new Date(validatedData.startDate),
              status: "ASSIGNED",
              progressPercentage: 0,
            }
          })
        )
      );
    }

    console.log(`Created ${userChallenges.length} user challenge assignments`);

    return NextResponse.json({
      success: true,
      assignment,
      userChallenges: userChallenges.length,
      message: `Challenge assigned successfully to ${userChallenges.length} student(s)`
    });

  } catch (error: any) {
    console.error('Error assigning challenge:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to assign challenge', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});

