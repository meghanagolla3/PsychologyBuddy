import { NextRequest } from 'next/server';
import { BadgeAdminController } from '@/src/server/controllers/badge.admin.controller';

const badgeAdminController = new BadgeAdminController();

export async function PATCH(req: NextRequest) {
  return badgeAdminController.updateBadge(req);
}

export async function DELETE(req: NextRequest) {
  return badgeAdminController.deleteBadge(req);
}
