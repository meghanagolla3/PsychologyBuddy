import { NextRequest } from 'next/server';
import { StudentController } from '@/src/profiles/student/student.controller';

// PUT /api/students/[id]/profile - Student self-update (Student only)
export const PUT = StudentController.studentSelfUpdate;
