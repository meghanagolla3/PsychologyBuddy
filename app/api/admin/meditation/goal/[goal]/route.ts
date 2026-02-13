import { NextRequest } from 'next/server';
import { MeditationAdminController } from '@/src/components/server/content/selfhelptools/meditation/meditation.admin.controller';

const adminController = new MeditationAdminController();

export async function GET(req: NextRequest) {
  return adminController.getMeditationsByGoal(req);
}
