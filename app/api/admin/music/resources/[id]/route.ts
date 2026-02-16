import { NextRequest, NextResponse } from "next/server";
import {
  getMusicResourceById,
  updateMusicResource,
  deleteMusicResource,
} from "@/src/components/server/content/selfhelptools/music/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getMusicResourceById(request);
}

export async function PATCH(request: NextRequest) {
  return await updateMusicResource(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteMusicResource(request);
}
