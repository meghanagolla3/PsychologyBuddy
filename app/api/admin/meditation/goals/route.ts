import { NextRequest, NextResponse } from "next/server";
import {
  createMeditationGoal,
  getMeditationGoals,
} from "@/src/server/controllers/meditation.admin.controller";

export async function GET(request: NextRequest) {
  return await getMeditationGoals(request);
}

export async function POST(request: NextRequest) {
  return await createMeditationGoal(request);
}
