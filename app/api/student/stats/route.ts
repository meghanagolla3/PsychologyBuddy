import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/src/utils/session-helper';
import { handleError } from '@/src/utils/errors';
import { BadgeService } from '@/src/server/services/badge.service';
import prisma from '@/src/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'badges.view');

    // Get all stats in parallel for better performance
    const [
      streak,
      writingJournalCount,
      audioJournalCount,
      artJournalCount,
      allResourceAccess,
      moodCheckinCount,
      userBadges,
    ] = await Promise.all([
      // Current streak
      prisma.streak.findUnique({
        where: { userId: session.userId },
      }),
      // Journal counts
      prisma.writingJournal.count({ where: { userId: session.userId } }),
      prisma.audioJournal.count({ where: { userId: session.userId } }),
      prisma.artJournal.count({ where: { userId: session.userId } }),
      // All resource access
      prisma.resourceAccess.findMany({
        where: { userId: session.userId },
        select: { resource: true },
      }),
      // Mood check-ins
      prisma.moodCheckin.count({ where: { userId: session.userId } }),
      // User badges
      prisma.userBadge.count({
        where: { userId: session.userId },
      }),
    ]);

    // Count by resource type
    const articleReadCount = allResourceAccess.filter(ra => ra.resource === 'ARTICLE').length;
    const meditationCount = allResourceAccess.filter(ra => ra.resource === 'MEDITATION').length;
    const musicCount = allResourceAccess.filter(ra => ra.resource === 'MUSIC').length;
    const totalResourcesUsed = articleReadCount + meditationCount + musicCount;

    const totalJournalCount = writingJournalCount + audioJournalCount + artJournalCount;

    return NextResponse.json({
      success: true,
      message: 'User stats retrieved successfully',
      data: {
        currentStreak: streak?.count || 0,
        totalCheckins: moodCheckinCount,
        resourcesUsed: totalResourcesUsed,
        badgesEarned: userBadges,
        // Additional detailed stats for future use
        detailedStats: {
          journals: {
            writing: writingJournalCount,
            audio: audioJournalCount,
            art: artJournalCount,
            total: totalJournalCount,
          },
          resources: {
            articles: articleReadCount,
            meditation: meditationCount,
            music: musicCount,
            total: totalResourcesUsed,
          },
          moodCheckins: moodCheckinCount,
          streak: streak?.count || 0,
          badges: userBadges,
        },
      },
    });
  } catch (err) {
    const errorResponse = handleError(err);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
}
