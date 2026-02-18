import { NextRequest, NextResponse } from "next/server";
import {
  getMusicCategories,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicCategories(request);
}
