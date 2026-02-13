import { NextRequest } from 'next/server';
import { journalingStudentController } from '@/src/components/server/content/selfhelptools/journaling/journaling.student.controller';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return journalingStudentController.deleteWritingJournal(req, { params });
}
