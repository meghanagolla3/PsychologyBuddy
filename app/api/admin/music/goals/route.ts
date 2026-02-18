import { NextRequest, NextResponse } from "next/server";
import {
  createMusicGoal,
  getMusicGoals,
} from "@/src/server/controllers/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getMusicGoals(request);
}

export async function POST(request: NextRequest) {
  return await createMusicGoal(request);
}
