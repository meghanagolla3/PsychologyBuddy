import { NextRequest } from 'next/server';
import { BadgeAdminController } from '@/src/components/server/badges/badge.admin.controller';

const badgeAdminController = new BadgeAdminController();

export async function POST(req: NextRequest) {
  return badgeAdminController.createBadge(req);
}

export async function GET(req: NextRequest) {
  return badgeAdminController.getBadges(req);
}
