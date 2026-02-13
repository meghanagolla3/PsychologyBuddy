import { NextRequest } from 'next/server';
import { musicAdminController } from '@/src/components/server/content/selfhelptools/music/music.admin.controller';

export async function POST(req: NextRequest) {
  return musicAdminController.createCategory(req);
}

export async function GET(req: NextRequest) {
  return musicAdminController.getCategories(req);
}
