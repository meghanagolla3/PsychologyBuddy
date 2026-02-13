import { NextRequest } from 'next/server';
import { musicInstructionsAdminController } from '@/src/components/server/content/selfhelptools/music/music-instructions.admin.controller';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return musicInstructionsAdminController.getInstructionsByResource(req);
}
