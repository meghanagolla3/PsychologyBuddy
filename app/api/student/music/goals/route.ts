import { NextRequest, NextResponse } from "next/server";
import {
  getMusicGoals,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicGoals(request);
}
