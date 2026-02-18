import { NextRequest, NextResponse } from "next/server";
import {
  getMusicInstructionById,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructionById(request);
}
