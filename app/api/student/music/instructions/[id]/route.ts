import { NextRequest, NextResponse } from "next/server";
import {
  getMusicInstructionById,
} from "@/src/components/server/content/selfhelptools/music/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructionById(request);
}
