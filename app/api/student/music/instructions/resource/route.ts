import { NextRequest, NextResponse } from "next/server";
import {
  getMusicInstructionsByResource,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructionsByResource(request);
}
