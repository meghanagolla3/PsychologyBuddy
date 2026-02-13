import { NextRequest } from 'next/server';
import { musicAdminController } from '@/src/components/server/content/selfhelptools/music/music.admin.controller';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Add id to URL search params for the controller
  const url = new URL(req.url);
  url.searchParams.set('id', params.id);
  
  // Create a new request with the updated URL
  const newReq = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  return musicAdminController.getMusicResource(newReq as NextRequest);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  url.searchParams.set('id', params.id);
  
  const newReq = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  return musicAdminController.updateMusicResource(newReq as NextRequest);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  url.searchParams.set('id', params.id);
  
  const newReq = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  return musicAdminController.deleteMusicResource(newReq as NextRequest);
}
