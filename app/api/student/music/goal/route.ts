import { NextRequest } from 'next/server';
import { musicStudentController } from '@/src/components/server/content/selfhelptools/music/music.student.controller';

export async function GET(req: NextRequest) {
  return musicStudentController.getMusicByGoal(req);
}
