import { NextRequest } from 'next/server';
import { CounselorController } from '@/src/server/profiles/counselor/counselor.controller';

// GET /api/counselors/[id]/sessions/by-date - Get sessions for specific date
export const GET = CounselorController.getSessionsByDate;
