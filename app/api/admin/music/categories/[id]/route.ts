import { NextRequest, NextResponse } from "next/server";
import {
  getMusicCategoryById,
  updateMusicCategory,
  deleteMusicCategory,
} from "@/src/server/controllers/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getMusicCategoryById(request);
}

export async function PATCH(request: NextRequest) {
  return await updateMusicCategory(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteMusicCategory(request);
}
