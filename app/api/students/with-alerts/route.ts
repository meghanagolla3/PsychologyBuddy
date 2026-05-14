import { StudentController } from '@/src/server/profiles/student/student.controller';

// GET /api/students/with-alerts - Get students with active escalation alerts
// Temporarily without permission middleware for testing - TODO: Add back withPermission('escalations.view')
export const GET = StudentController.getStudentsWithAlerts;
