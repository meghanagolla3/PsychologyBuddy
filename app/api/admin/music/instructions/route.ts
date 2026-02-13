import { NextRequest } from 'next/server';
import { musicInstructionsAdminController } from '@/src/components/server/content/selfhelptools/music/music-instructions.admin.controller';

export async function POST(req: NextRequest) {
  return musicInstructionsAdminController.createInstruction(req);
}

export async function GET(req: NextRequest) {
  return musicInstructionsAdminController.getInstructions(req);
}
