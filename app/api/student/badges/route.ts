import { NextRequest } from 'next/server';
import { BadgeStudentController } from '@/src/server/controllers/badge.student.controller';

const badgeStudentController = new BadgeStudentController();

export async function GET(req: NextRequest) {
  return badgeStudentController.getUserBadges(req);
}
