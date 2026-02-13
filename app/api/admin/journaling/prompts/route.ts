import { NextRequest } from 'next/server';
import { journalingAdminController } from '@/src/components/server/content/selfhelptools/journaling/journaling.admin.controller';

export async function POST(req: NextRequest) {
  return journalingAdminController.createPrompt(req);
}

export async function GET(req: NextRequest) {
  return journalingAdminController.getAllPrompts(req);
}
