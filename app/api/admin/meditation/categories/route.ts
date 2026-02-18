import { NextRequest, NextResponse } from "next/server";
import {
  createMeditationCategory,
  getMeditationCategories,
} from "@/src/server/controllers/meditation.admin.controller";

export async function GET(request: NextRequest) {
  return await getMeditationCategories(request);
}

export async function POST(request: NextRequest) {
  return await createMeditationCategory(request);
}
