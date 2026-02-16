import { NextRequest, NextResponse } from "next/server";
import {
  getMusicGoalById,
  updateMusicGoal,
  deleteMusicGoal,
} from "@/src/components/server/content/selfhelptools/music/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getMusicGoalById(request);
}

export async function PATCH(request: NextRequest) {
  return await updateMusicGoal(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteMusicGoal(request);
}
