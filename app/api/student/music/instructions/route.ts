import { NextRequest, NextResponse } from "next/server";
import {
  getMusicInstructions,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructions(request);
}
