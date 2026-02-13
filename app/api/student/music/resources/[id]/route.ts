import { NextRequest } from 'next/server';
import { musicStudentController } from '@/src/components/server/content/selfhelptools/music/music.student.controller';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  url.searchParams.set('id', params.id);
  
  const newReq = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  return musicStudentController.getMusicResourceById(newReq as NextRequest);
}
