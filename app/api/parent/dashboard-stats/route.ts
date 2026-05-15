import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';
import { startOfDay, subDays, format } from 'date-fns';

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

    // Get the first child of this parent
    const child = await prisma.user.findFirst({
      where: {
        parentId: parentId,
        schoolId: schoolId,
        role: { name: 'STUDENT' }
      },
      select: { id: true, firstName: true }
    });

    if (!child) {
      return NextResponse.json({ success: false, message: 'No child found' }, { status: 404 });
    }

    const studentId = child.id;
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return startOfDay(date);
    });

    // 1. Stats Summary
    const [toolsCount, exercisesCount, challengesCount, sessionsCount] = await Promise.all([
      // Tools: Journals + Resource Access
      prisma.writingJournal.count({ where: { userId: studentId } }).then(c => 
        prisma.audioJournal.count({ where: { userId: studentId } }).then(a => 
          prisma.artJournal.count({ where: { userId: studentId } }).then(art => c + a + art)
        )
      ),
      // Exercises: Meditations + Music Therapy completions (simulated via ResourceAccess for now if no completions table)
      prisma.resourceAccess.count({ 
        where: { 
          userId: studentId,
          resource: { in: ['MEDITATION', 'MUSIC_THERAPY'] }
        } 
      }),
      // Challenges
      prisma.userChallenge.count({ 
        where: { 
          userId: studentId,
          status: 'COMPLETED'
        } 
      }),
      // Counseling Sessions
      prisma.counselingSession.count({ 
        where: { 
          studentId: studentId,
          status: 'COMPLETED'
        } 
      })
    ]);

    // 2. Activity Trends (Datasets)
    const datasets: any = {
      Tools: [],
      Exercises: [],
      Streak: [],
      Badges: [],
      Challenges: []
    };

    for (const date of last7Days) {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const dayLabel = format(date, 'eee');

      const [dTools, dEx, dChallenges, dBadges] = await Promise.all([
        prisma.resourceAccess.count({
          where: {
            userId: studentId,
            createdAt: { gte: date, lt: nextDate }
          }
        }),
        prisma.resourceAccess.count({
          where: {
            userId: studentId,
            resource: { in: ['MEDITATION', 'MUSIC_THERAPY'] },
            createdAt: { gte: date, lt: nextDate }
          }
        }),
        prisma.userChallenge.count({
          where: {
            userId: studentId,
            status: 'COMPLETED',
            completedAt: { gte: date, lt: nextDate }
          }
        }),
        prisma.userBadge.count({
          where: {
            userId: studentId,
            earnedAt: { gte: date, lt: nextDate }
          }
        })
      ]);

      datasets.Tools.push({ day: dayLabel, value: dTools });
      datasets.Exercises.push({ day: dayLabel, value: dEx });
      datasets.Challenges.push({ day: dayLabel, value: dChallenges });
      datasets.Badges.push({ day: dayLabel, value: dBadges });
      
      // Streak (just using the current streak for the last day, or simulating growth)
      datasets.Streak.push({ day: dayLabel, value: Math.floor(Math.random() * 5) + 1 }); // Simulated for now
    }

    return NextResponse.json({
      success: true,
      data: {
        childName: child.firstName,
        stats: {
          toolsUsed: toolsCount,
          exercisesDone: exercisesCount,
          challenges: challengesCount,
          sessions: sessionsCount
        },
        datasets
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});
