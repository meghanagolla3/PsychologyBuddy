import { NextRequest, NextResponse } from "next/server";
import {
  getMusicByGoal,
} from "@/src/server/controllers/music.student.controller";

export async function GET(request: NextRequest) {
  return await getMusicByGoal(request);
}
