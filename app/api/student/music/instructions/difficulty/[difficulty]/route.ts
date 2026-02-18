import { NextRequest, NextResponse } from "next/server";
import {
  getMusicInstructionsByDifficulty,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructionsByDifficulty(request);
}
