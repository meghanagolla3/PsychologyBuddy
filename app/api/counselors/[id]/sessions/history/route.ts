import { NextRequest } from 'next/server';
import { CounselorController } from '@/src/server/profiles/counselor/counselor.controller';

// GET /api/counselors/[id]/sessions/history - Get session history
export const GET = CounselorController.getSessionHistory;
