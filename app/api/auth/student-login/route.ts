import { NextRequest } from 'next/server';
import { authController } from '@/src/auth/auth.controller';

export async function POST(req: NextRequest) {
  return authController.studentLogin(req);
}
