import { NextRequest } from 'next/server';
import { CounselorController } from '@/src/server/profiles/counselor/counselor.controller';

// GET /api/counselors/[id] - Get counselor by ID (Admin, SuperAdmin, School SuperAdmin)
export const GET = CounselorController.getCounselorById;

// PUT /api/counselors/[id] - Update counselor (Admin, SuperAdmin, School SuperAdmin)
export const PUT = CounselorController.updateCounselor;

// PATCH /api/counselors/[id] - Update counselor status (Admin, SuperAdmin, School SuperAdmin)
export const PATCH = CounselorController.updateCounselorStatus;

// DELETE /api/counselors/[id] - Delete counselor (SuperAdmin only)
export const DELETE = CounselorController.deleteCounselor;
