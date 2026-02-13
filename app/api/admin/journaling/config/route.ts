import { NextRequest } from 'next/server';
import { journalingAdminController } from '@/src/components/server/content/selfhelptools/journaling/journaling.admin.controller';

export async function GET(req: NextRequest) {
  return journalingAdminController.getJournalingConfig(req);
}

export async function PATCH(req: NextRequest) {
  return journalingAdminController.updateJournalingConfig(req);
}
