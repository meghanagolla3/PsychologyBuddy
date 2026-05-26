import { NextRequest } from 'next/server';
import { CounselorController } from '@/src/server/profiles/counselor/counselor.controller';

// GET /api/counselors/[id]/sessions/by-month - Get sessions for a month
export const GET = CounselorController.getSessionsByMonth;
