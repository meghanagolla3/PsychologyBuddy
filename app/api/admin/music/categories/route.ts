import { NextRequest, NextResponse } from "next/server";
import {
  createMusicCategory,
  getMusicCategories,
} from "@/src/server/controllers/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getMusicCategories(request);
}

export async function POST(request: NextRequest) {
  return await createMusicCategory(request);
}
