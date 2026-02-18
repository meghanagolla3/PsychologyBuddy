import { NextRequest } from 'next/server';
import { journalingAdminController } from '@/src/server/controllers/journaling.admin.controller';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return journalingAdminController.updatePrompt(req, { params });
}
