import { NextRequest } from 'next/server';
import { StudentController } from '@/src/components/server/profiles/student/student.controller';

// POST /api/students - Create student (Admin only)
export const POST = StudentController.createStudent;

// GET /api/students - Get students by school (Admin only)
export const GET = StudentController.getStudents;
