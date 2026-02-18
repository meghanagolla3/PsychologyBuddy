import { NextRequest, NextResponse } from "next/server";
import {
  getMusicResources,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicResources(request);
}
