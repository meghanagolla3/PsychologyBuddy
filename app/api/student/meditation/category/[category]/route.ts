import { NextRequest } from 'next/server';
import { MeditationStudentController } from '@/src/components/server/content/selfhelptools/meditation/meditation.student.controller';

const studentController = new MeditationStudentController();

export async function GET(req: NextRequest) {
  return studentController.getMeditationsByCategory(req);
}
