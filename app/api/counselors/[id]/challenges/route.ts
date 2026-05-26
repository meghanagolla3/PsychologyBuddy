import { NextRequest } from 'next/server';
import { CounselorController } from '@/src/server/profiles/counselor/counselor.controller';

// GET /api/counselors/[id]/challenges - Get active challenges
export const GET = CounselorController.getActiveChallenges;
