import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/src/utils/session-helper";
import { AuthError } from "@/src/utils/errors";
import { ChallengeProgressService } from "@/src/services/challenges/challenge-progress.service";
import { ModuleType } from "@/src/services/challenges/types/challenge.types";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission(request, 'challenges.view');

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenges = await ChallengeProgressService.getModuleChallenges(
      session.userId, 
      ModuleType.JOURNALING
    );

    return NextResponse.json({
      success: true,
      data: challenges,
      message: "Journaling challenges retrieved successfully"
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching journaling challenges:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch journaling challenges',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission(request, 'challenges.view');

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    const userChallenge = await ChallengeProgressService.startChallenge(
      session.userId, 
      challengeId
    );

    return NextResponse.json({
      success: true,
      data: userChallenge,
      message: "Journaling challenge started successfully"
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error starting journaling challenge:', error);
    return NextResponse.json(
      {
        error: 'Failed to start journaling challenge',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
