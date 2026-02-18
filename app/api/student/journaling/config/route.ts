import { NextRequest } from 'next/server';
import { journalingStudentController } from '@/src/server/controllers/journaling.student.controller';

// GET /api/student/journaling/config - Get journaling configuration for student's school
export async function GET(req: NextRequest) {
  return journalingStudentController.getJournalingConfig(req);
}
