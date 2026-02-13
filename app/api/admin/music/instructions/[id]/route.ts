import { NextRequest } from 'next/server';
import { musicInstructionsAdminController } from '@/src/components/server/content/selfhelptools/music/music-instructions.admin.controller';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return musicInstructionsAdminController.getInstruction(req);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return musicInstructionsAdminController.updateInstruction(req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return musicInstructionsAdminController.deleteInstruction(req);
}
