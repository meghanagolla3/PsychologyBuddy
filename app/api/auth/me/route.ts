import { NextRequest } from 'next/server';
import { authController } from '@/src/server/controllers/auth.controller';

export async function GET(req: NextRequest) {
  return authController.me(req);
}
