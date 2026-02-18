import { NextRequest, NextResponse } from "next/server";
import {
  searchMusic,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await searchMusic(request);
}
