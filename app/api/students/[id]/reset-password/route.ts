import { NextRequest } from 'next/server';
import { StudentController } from '@/src/server/profiles/student/student.controller';

// POST /api/students/[id]/reset-password - Reset student password (Admin only)
export const POST = StudentController.resetStudentPassword;
