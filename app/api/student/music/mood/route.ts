import { NextResponse } from 'next/server';
import { musicStudentController } from '@/src/components/server/content/selfhelptools/music/music.student.controller';

export async function GET(req: Request) {
  return NextResponse.json({
    success: false,
    error: { message: 'Mood filtering is not available. Please use category filtering instead.' }
  }, { status: 400 });
}
