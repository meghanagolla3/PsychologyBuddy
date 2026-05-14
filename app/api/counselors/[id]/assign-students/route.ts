import { CounselorController } from '@/src/server/profiles/counselor/counselor.controller';

// POST /api/counselors/[id]/assign-students - Assign students to counselor
export const POST = CounselorController.assignStudents;
