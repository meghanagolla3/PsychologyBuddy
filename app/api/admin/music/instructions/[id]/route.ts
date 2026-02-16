import { NextRequest, NextResponse } from "next/server";
import {
  getMusicInstructionById,
  updateMusicInstruction,
  deleteMusicInstruction,
} from "@/src/components/server/content/selfhelptools/music/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getMusicInstructionById(request);
}

export async function PATCH(request: NextRequest) {
  return await updateMusicInstruction(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteMusicInstruction(request);
}
