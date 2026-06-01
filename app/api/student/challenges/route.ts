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

    const userId = session.userId;
    const { searchParams } = new URL(request.url);
    const moduleType = searchParams.get('module') as ModuleType;

    if (moduleType) {
      // Get challenges for specific module
      const moduleChallenges = await ChallengeProgressService.getModuleChallenges(userId, moduleType);
      
      return NextResponse.json({
        success: true,
        data: moduleChallenges
      });
    } else {
      // Get dashboard data for all modules
      const dashboard = await ChallengeProgressService.getChallengeDashboard(userId);
      
      return NextResponse.json({
        success: true,
        data: dashboard
      });
    }

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch challenges',
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

    const userChallenge = await ChallengeProgressService.startChallenge(session.userId, challengeId);

    return NextResponse.json({
      success: true,
      data: userChallenge,
      message: "Challenge started successfully"
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error starting challenge:', error);
    return NextResponse.json(
      {
        error: 'Failed to start challenge',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

