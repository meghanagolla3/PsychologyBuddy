import { NextRequest } from 'next/server';
import { BadgeStudentController } from '@/src/components/server/badges/badge.student.controller';

const badgeStudentController = new BadgeStudentController();

export async function GET(req: NextRequest) {
  return badgeStudentController.getUserBadges(req);
}
