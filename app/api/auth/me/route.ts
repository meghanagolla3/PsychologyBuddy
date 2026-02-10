import { NextRequest } from 'next/server';
import { authController } from '@/src/auth/auth.controller';

export async function GET(req: NextRequest) {
  return authController.me(req);
}
