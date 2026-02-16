import { NextRequest, NextResponse } from "next/server";
import {
  createMusicInstruction,
  getMusicInstructions,
} from "@/src/components/server/content/selfhelptools/music/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructions(request);
}

export async function POST(request: NextRequest) {
  return await createMusicInstruction(request);
}
