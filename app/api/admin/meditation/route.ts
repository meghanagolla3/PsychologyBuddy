import { NextRequest } from 'next/server';
import { MeditationAdminController } from '@/src/components/server/content/selfhelptools/meditation/meditation.admin.controller';

const adminController = new MeditationAdminController();

export async function POST(req: NextRequest) {
  return adminController.createMeditation(req);
}

export async function GET(req: NextRequest) {
  return adminController.getMeditations(req);
}
