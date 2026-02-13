import { NextRequest } from 'next/server';
import { musicInstructionsStudentController } from '@/src/components/server/content/selfhelptools/music/music-instructions.student.controller';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return musicInstructionsStudentController.getInstructionsWithResource(req);
}
