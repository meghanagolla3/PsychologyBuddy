import { NextRequest } from 'next/server';
import { journalingAdminController } from '@/src/server/controllers/journaling.admin.controller';

export async function POST(req: NextRequest) {
  return journalingAdminController.createPrompt(req);
}

export async function GET(req: NextRequest) {
  return journalingAdminController.getAllPrompts(req);
}
