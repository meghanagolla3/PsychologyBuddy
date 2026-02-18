import { NextRequest, NextResponse } from "next/server";
import {
  getMeditationGoalById,
  updateMeditationGoal,
  deleteMeditationGoal,
} from "@/src/server/controllers/meditation.admin.controller";

export async function GET(request: NextRequest) {
  return await getMeditationGoalById(request);
}

export async function PUT(request: NextRequest) {
  return await updateMeditationGoal(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteMeditationGoal(request);
}
