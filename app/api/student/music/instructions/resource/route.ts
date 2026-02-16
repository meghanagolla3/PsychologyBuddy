import { NextRequest, NextResponse } from "next/server";
import {
  getMusicInstructionsByResource,
} from "@/src/components/server/content/selfhelptools/music/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructionsByResource(request);
}
