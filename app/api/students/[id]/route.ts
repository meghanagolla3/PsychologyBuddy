import { NextRequest } from 'next/server';
import { StudentController } from '@/src/server/profiles/student/student.controller';

// GET /api/students/[id] - Get student by ID
export const GET = StudentController.getStudentById;

// PUT /api/students/[id] - Update student (Admin only)
export const PUT = StudentController.updateStudent;

// PATCH /api/students/[id] - Update student status (Admin only)
export const PATCH = StudentController.updateStudentStatus;

// DELETE /api/students/[id] - Delete student (Admin only)
export const DELETE = StudentController.deleteStudent;
