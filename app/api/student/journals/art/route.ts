import { NextRequest } from 'next/server';
import { journalingStudentController } from '@/src/server/controllers/journaling.student.controller';

export async function POST(req: NextRequest) {
  return journalingStudentController.createArtJournal(req);
}

export async function GET(req: NextRequest) {
  return journalingStudentController.getArtJournals(req);
}
