import { NextRequest } from 'next/server';
import { StudentController } from '@/src/profiles/student/student.controller';

// POST /api/students/generate-id - Generate unique student ID (Admin only)
export const POST = StudentController.generateStudentId;
