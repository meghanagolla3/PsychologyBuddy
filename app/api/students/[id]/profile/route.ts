import { NextRequest } from 'next/server';
import { StudentController } from '@/src/server/profiles/student/student.controller';

// GET /api/students/[id]/profile - Get student profile data
export const GET = StudentController.getStudentProfileForStudent;

// PUT /api/students/[id]/profile - Student self-update (Student only)
export const PUT = StudentController.studentSelfUpdate;
