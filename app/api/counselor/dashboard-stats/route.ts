import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';
import { startOfDay, endOfDay, startOfMonth, subMonths, format } from 'date-fns';

export const GET = withPermission({
  module: 'DASHBOARD',
  action: 'VIEW',
})(async (req: NextRequest, { user }: any) => {
  try {
    const counselorId = user.id;
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // 1. Stats
    const [highRiskCount, todaySessions, todayParentMeetings, completedSessions] = await Promise.all([
      prisma.highRiskAlert.count({
        where: { resolved: false }
      }),
      prisma.counselingSession.count({
        where: {
          counselorId,
          scheduledAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      prisma.parentMeeting.count({
        where: {
          counselorId,
          date: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      prisma.counselingSession.count({
        where: {
          counselorId,
          status: 'COMPLETED'
        }
      })
    ]);

    // 2. Priority Students (Assigned Students)
    const assignments = await prisma.counselorAssignment.findMany({
      where: { 
        counselorId,
        status: 'ACTIVE'
      },
      take: 6,
      orderBy: { assignedAt: 'desc' },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            updatedAt: true
          }
        }
      }
    });

    const students = assignments.map(assignment => {
      const { student } = assignment;
      const initials = `${student.firstName[0]}${student.lastName[0]}`;
      const levelNum = parseInt(assignment.level?.replace(/[^0-9]/g, '') || '1') || 1;
      
      return {
        name: `${student.firstName} ${student.lastName}`,
        initials,
        active: student.updatedAt ? format(new Date(student.updatedAt), 'p') : 'Recently',
        level: levelNum
      };
    });

    // 3. Recent & Upcoming Sessions
    const [recentSessionsRaw, upcomingSessionsRaw] = await Promise.all([
      prisma.counselingSession.findMany({
        where: {
          counselorId,
          scheduledAt: { lt: today }
        },
        take: 4,
        orderBy: { scheduledAt: 'desc' },
        include: { student: { select: { firstName: true, lastName: true } } }
      }),
      prisma.counselingSession.findMany({
        where: {
          counselorId,
          scheduledAt: { gte: today }
        },
        take: 4,
        orderBy: { scheduledAt: 'asc' },
        include: { student: { select: { firstName: true, lastName: true } } }
      })
    ]);

    const recentSessions = recentSessionsRaw.map(s => ({
      name: `${s.student.firstName} ${s.student.lastName}`,
      type: s.sessionType,
      date: format(new Date(s.scheduledAt), 'yyyy-MM-dd')
    }));

    const upcomingSessions = upcomingSessionsRaw.map(s => ({
      name: `${s.student.firstName} ${s.student.lastName}`,
      type: s.sessionType,
      date: format(new Date(s.scheduledAt), 'yyyy-MM-dd')
    }));

    // 4. Chart Data (Last 7 months)
    const months = Array.from({ length: 7 }, (_, i) => subMonths(today, 6 - i));
    
    const chartData = await Promise.all(months.map(async (month) => {
      const start = startOfMonth(month);
      const end = endOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));

      const [sessions, meetings, challenges] = await Promise.all([
        prisma.counselingSession.count({
          where: {
            counselorId,
            scheduledAt: { gte: start, lte: end }
          }
        }),
        prisma.parentMeeting.count({
          where: {
            counselorId,
            date: { gte: start, lte: end }
          }
        }),
        prisma.challenge.count({
          where: {
            createdBy: counselorId,
            createdAt: { gte: start, lte: end }
          }
        })
      ]);

      return {
        month: format(month, 'MMM'),
        Sessions: sessions,
        "Parent Meetings": meetings,
        Challenges: challenges
      };
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          highRiskAlerts: highRiskCount.toString().padStart(2, '0'),
          todaySessions: todaySessions.toString().padStart(2, '0'),
          todayParentMeetings: todayParentMeetings.toString().padStart(2, '0'),
          completedSessions: completedSessions.toString().padStart(2, '0')
        },
        students,
        recentSessions,
        upcomingSessions,
        lineData: chartData.map(({ month, Sessions, "Parent Meetings": meetings }) => ({
          month, Sessions, "Parent Meetings": meetings
        })),
        barData: chartData.map(({ month, Challenges }) => ({
          month, Challenges
        }))
      }
    });

  } catch (error) {
    console.error('Counselor Dashboard Stats API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
});

