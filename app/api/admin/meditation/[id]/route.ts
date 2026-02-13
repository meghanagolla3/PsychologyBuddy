import { NextRequest } from 'next/server';
import { MeditationAdminController } from '@/src/components/server/content/selfhelptools/meditation/meditation.admin.controller';

const adminController = new MeditationAdminController();

export async function GET(req: NextRequest) {
  return adminController.getMeditationById(req);
}

export async function PATCH(req: NextRequest) {
  return adminController.updateMeditation(req);
}

export async function DELETE(req: NextRequest) {
  return adminController.deleteMeditation(req);
}
