import { NextRequest } from 'next/server';
import { journalingAdminController } from '@/src/server/controllers/journaling.admin.controller';

export async function GET(req: NextRequest) {
  return journalingAdminController.getJournalingConfig(req);
}

export async function PATCH(req: NextRequest) {
  return journalingAdminController.updateJournalingConfig(req);
}

export async function PUT(req: NextRequest) {
  return journalingAdminController.updateJournalingConfig(req);
}
