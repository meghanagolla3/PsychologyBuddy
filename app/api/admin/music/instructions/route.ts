import { NextRequest, NextResponse } from "next/server";
import {
  createMusicInstruction,
  getMusicInstructions,
  deleteAllMusicInstructions,
} from "@/src/server/controllers/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructions(request);
}

export async function POST(request: NextRequest) {
  return await createMusicInstruction(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteAllMusicInstructions(request);
}
