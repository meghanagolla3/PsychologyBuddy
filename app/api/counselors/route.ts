import { NextRequest } from 'next/server';
import { CounselorController } from '@/src/server/profiles/counselor/counselor.controller';

// POST /api/counselors - Create counselor (Admin, SuperAdmin, School SuperAdmin)
export const POST = CounselorController.createCounselor;

// GET /api/counselors - Get all counselors (Admin, SuperAdmin, School SuperAdmin)
export const GET = CounselorController.getCounselors;
