import { NextRequest } from 'next/server';
import { CounselorController } from '@/src/server/profiles/counselor/counselor.controller';

// GET /api/counselors/[id]/wellness-challenges - Get wellness challenges
export const GET = CounselorController.getWellnessChallenges;
