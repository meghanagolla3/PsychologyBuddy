import { NextRequest, NextResponse } from "next/server";
import {
  getMusicResourceById,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicResourceById(request);
}
