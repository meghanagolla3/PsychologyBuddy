import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/src/utils/session-helper";
import { AuthError } from "@/src/utils/errors";
import { ChallengeProgressService } from "@/src/services/challenges/challenge-progress.service";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission(request, 'challenges.view');

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ChallengeProgressService.getUserProfile(session.userId);

    return NextResponse.json({
      success: true,
      data: profile,
      message: "User profile retrieved successfully"
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
