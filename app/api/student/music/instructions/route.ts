import { NextRequest, NextResponse } from "next/server";
import {
  getMusicInstructions,
} from "@/src/components/server/content/selfhelptools/music/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructions(request);
}
