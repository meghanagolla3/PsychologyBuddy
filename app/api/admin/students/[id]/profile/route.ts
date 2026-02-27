import { NextRequest } from 'next/server';
import { StudentController } from '@/src/server/profiles/student/student.controller';

// GET /api/admin/students/[id]/profile - Get student profile for admin view
export const GET = StudentController.getStudentProfileForAdmin;
