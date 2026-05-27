import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/src/utils/session-helper";
import { AuthError } from "@/src/utils/errors";
import prisma from '@/src/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission(request, 'challenges.view');

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    // Fetch all UserChallenge records for this student, with the Challenge details
    const userChallenges = await prisma.userChallenge.findMany({
      where: { userId },
      include: {
        challenge: {
          include: {
            creator: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    const assignedRaw = userChallenges.filter(
      (uc) => uc.status !== 'COMPLETED' && uc.status !== 'EXPIRED'
    );
    const completedRaw = userChallenges.filter((uc) => uc.status === 'COMPLETED');

    // Transform assigned challenges
    const assignedChallenges = assignedRaw.map((uc) => {
      const challenge = uc.challenge;
      return {
        id: challenge.id,
        title: challenge.name,
        category: getCategoryFromTools(challenge),
        description: challenge.description,
        instructions: challenge.instructions ?? challenge.description,
        progress: uc.progressPercentage ?? 0,
        startDate: (uc.startedAt ?? uc.assignedAt).toISOString().split('T')[0],
        endDate: challenge.endsAt.toISOString().split('T')[0],
        daysLeft: calculateDaysLeft(challenge.endsAt),
        status: uc.status,
        tone: getToneFromCategory(getCategoryFromTools(challenge)),
        createdBy:
          `${challenge.creator?.firstName ?? ''} ${challenge.creator?.lastName ?? ''}`.trim() ||
          'System',
      };
    });

    // Transform completed challenges
    const completedChallenges = completedRaw.map((uc) => {
      const challenge = uc.challenge;
      return {
        id: challenge.id,
        title: challenge.name,
        category: getCategoryFromTools(challenge),
        description: challenge.description,
        instructions: challenge.instructions ?? challenge.description,
        progress: 100,
        completedOn: (uc.completedAt ?? uc.lastActivityAt ?? new Date())
          .toISOString()
          .split('T')[0],
        daysTaken: calculateDaysTaken(
          uc.startedAt ?? uc.assignedAt,
          uc.completedAt ?? new Date()
        ),
        status: 'COMPLETED',
        tone: getToneFromCategory(getCategoryFromTools(challenge)),
        createdBy:
          `${challenge.creator?.firstName ?? ''} ${challenge.creator?.lastName ?? ''}`.trim() ||
          'System',
      };
    });

    return NextResponse.json({ assignedChallenges, completedChallenges });
  } catch (error) {
    // Return proper 401/403 for auth errors thrown by requirePermission
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching student challenges:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch challenges',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function calculateDaysLeft(endDate: Date | string): number {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffMs = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function calculateDaysTaken(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): number {
  if (!startDate || !endDate) return 0;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function getCategoryFromTools(challenge: any): string {
  if (challenge.requiresJournaling) return 'Journaling';
  if (challenge.requiresMeditation) return 'Meditation';
  if (challenge.requiresMusic) return 'Music';
  if (challenge.requiresPsychoeducation) return 'Psychoeducation';
  return challenge.category || 'Wellbeing';
}

function getToneFromCategory(category: string): 'warning' | 'info' | 'success' {
  const lower = category.toLowerCase();
  if (lower.includes('meditation') || lower.includes('mindfulness')) return 'info';
  if (lower.includes('journaling')) return 'warning';
  if (lower.includes('psychoeducation') || lower.includes('music')) return 'success';
  return 'info';
}

