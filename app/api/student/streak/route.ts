import { NextRequest } from 'next/server';
import { BadgeStudentController } from '@/src/server/controllers/badge.student.controller';
import prisma from '@/src/prisma';
import { requirePermission } from '@/src/utils/session-helper';

const badgeStudentController = new BadgeStudentController();

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'badges.view');
    
    const rawStreak = await prisma.streak.findUnique({
      where: { userId: session.userId },
    });

    return badgeStudentController.getUserStreak(req);
  } catch (error) {
    console.error('Streak route error:', error);
    return badgeStudentController.getUserStreak(req);
  }
}
