import { NextRequest } from 'next/server';
import { musicAdminController } from '@/src/components/server/content/selfhelptools/music/music.admin.controller';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  url.searchParams.set('id', params.id);
  
  const newReq = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  return musicAdminController.updateGoal(newReq as NextRequest);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  url.searchParams.set('id', params.id);
  
  const newReq = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  return musicAdminController.deleteGoal(newReq as NextRequest);
}
