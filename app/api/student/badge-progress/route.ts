import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { BadgeService } from '@/src/server/services/badge.service';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'badges.view');

    // Get user's badges with progress
    const userBadges = await BadgeService.getUserBadges(session.userId);
    
    // If no badges exist, return proper no-badges state
    if (userBadges.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No badges available',
        data: {
          progress: 0,
          nextBadge: null,
          totalBadges: 0,
          earnedBadges: 0,
        },
      });
    }
    
    // Find the next unearned badge with the highest progress
    const unearnedBadges = userBadges.filter(badge => badge.progress < 100);
    
    let nextBadge = null;
    let progress = 0;
    
    if (unearnedBadges.length > 0) {
      // Sort by progress (highest first) and find the one with most progress
      unearnedBadges.sort((a, b) => b.progress - a.progress);
      nextBadge = unearnedBadges[0];
      progress = nextBadge.progress;
    }

    // If all badges are earned, show 100% completion
    if (unearnedBadges.length === 0) {
      progress = 100;
    }

    return NextResponse.json({
      success: true,
      message: 'Badge progress retrieved successfully',
      data: {
        progress,
        nextBadge: nextBadge ? {
          name: nextBadge.badge.name,
          description: nextBadge.badge.description,
          icon: nextBadge.badge.icon,
        } : null,
        totalBadges: userBadges.length,
        earnedBadges: userBadges.filter(b => b.progress === 100).length,
      },
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
