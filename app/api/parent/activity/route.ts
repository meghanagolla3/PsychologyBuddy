import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export const GET = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    const parentId = user?.id;
    const schoolId = user?.schoolId;

    if (!parentId || !schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const child = await prisma.user.findFirst({
      where: { parentId, schoolId, role: { name: 'STUDENT' } },
      select: { id: true, firstName: true }
    });

    if (!child) {
      return NextResponse.json({ success: false, message: 'No child found' }, { status: 404 });
    }

    const studentId = child.id;
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // 1. Today's Summary
    const [toolsUsed, exercisesDone, challengesCount] = await Promise.all([
      prisma.resourceAccess.count({ 
        where: { 
          userId: studentId,
          createdAt: { gte: startOfToday, lt: endOfToday }
        } 
      }),
      prisma.resourceAccess.count({ 
        where: { 
          userId: studentId,
          resource: { in: ['MEDITATION', 'MUSIC_THERAPY'] },
          createdAt: { gte: startOfToday, lt: endOfToday }
        } 
      }),
      prisma.userChallenge.count({ 
        where: { 
          userId: studentId,
          status: 'COMPLETED',
          completedAt: { gte: startOfToday, lt: endOfToday }
        } 
      })
    ]);

    // 2. Challenges List
    const challengeList = await prisma.userChallenge.findMany({
      where: { userId: studentId },
      include: { challenge: true },
      orderBy: { assignedAt: 'desc' },
      take: 10
    });

    // 3. Today's Activity Timeline
    const [
      writingJournals,
      audioJournals,
      artJournals,
      accessLogs,
      articleCompletions,
      earnedBadges
    ] = await Promise.all([
      prisma.writingJournal.findMany({
        where: { userId: studentId, createdAt: { gte: startOfToday, lt: endOfToday } },
        select: { createdAt: true }
      }),
      prisma.audioJournal.findMany({
        where: { userId: studentId, createdAt: { gte: startOfToday, lt: endOfToday } },
        select: { createdAt: true }
      }),
      prisma.artJournal.findMany({
        where: { userId: studentId, createdAt: { gte: startOfToday, lt: endOfToday } },
        select: { createdAt: true }
      }),
      prisma.resourceAccess.findMany({
        where: { userId: studentId, createdAt: { gte: startOfToday, lt: endOfToday } },
        select: { resource: true, createdAt: true }
      }),
      prisma.articleCompletion.findMany({
        where: { studentId: studentId, createdAt: { gte: startOfToday, lt: endOfToday } },
        include: { article: { select: { title: true } } }
      }),
      prisma.userBadge.findMany({
        where: { userId: studentId, earnedAt: { gte: startOfToday, lt: endOfToday } },
        include: { badge: { select: { name: true } } }
      })
    ]);

    const timeline = [
      ...writingJournals.map(j => ({ name: 'Writing Journal', time: j.createdAt })),
      ...audioJournals.map(j => ({ name: 'Audio Journal', time: j.createdAt })),
      ...artJournals.map(j => ({ name: 'Art Journal', time: j.createdAt })),
      ...accessLogs.map(a => ({ name: a.resource.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '), time: a.createdAt })),
      ...articleCompletions.map(c => ({ name: `Read: ${c.article.title}`, time: c.createdAt })),
      ...earnedBadges.map(b => ({ name: `Earned Badge: ${b.badge.name}`, time: b.earnedAt }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime());

    return NextResponse.json({
      success: true,
      data: {
        childName: child.firstName,
        summary: { toolsUsed, exercisesDone, challenges: challengesCount },
        challenges: challengeList.map(uc => ({
          name: uc.challenge.name,
          status: uc.status.toLowerCase()
        })),
        activity: timeline.map(t => ({
          name: t.name,
          time: t.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      }
    });

  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});
