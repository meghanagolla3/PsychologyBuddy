import { NextRequest } from 'next/server';
import { journalingAdminController } from '@/src/server/controllers/journaling.admin.controller';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return journalingAdminController.updatePrompt(req, { params });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return journalingAdminController.updatePrompt(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return journalingAdminController.deletePrompt(req, { params });
}
