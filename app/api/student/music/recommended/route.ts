import { NextRequest, NextResponse } from "next/server";
import {
  getRecommendedMusic,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getRecommendedMusic(request);
}
