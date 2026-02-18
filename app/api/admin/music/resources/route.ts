import { NextRequest, NextResponse } from "next/server";
import {
  createMusicResource,
  getMusicResources,
} from "@/src/server/controllers/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getMusicResources(request);
}

export async function POST(request: NextRequest) {
  return await createMusicResource(request);
}
