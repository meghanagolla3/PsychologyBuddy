import { NextRequest } from 'next/server';
import { journalingStudentController } from '@/src/components/server/content/selfhelptools/journaling/journaling.student.controller';

export async function POST(req: NextRequest) {
  return journalingStudentController.createAudioJournal(req);
}

export async function GET(req: NextRequest) {
  return journalingStudentController.getAudioJournals(req);
}
