import { NextRequest, NextResponse } from "next/server";
import {
  getMeditationCategoryById,
  updateMeditationCategory,
  deleteMeditationCategory,
} from "@/src/server/controllers/meditation.admin.controller";

export async function GET(request: NextRequest) {
  return await getMeditationCategoryById(request);
}

export async function PUT(request: NextRequest) {
  return await updateMeditationCategory(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteMeditationCategory(request);
}
