import { NextRequest, NextResponse } from "next/server";
import {
  getMeditationResourceById,
  updateMeditationResource,
  deleteMeditationResource,
} from "@/src/server/controllers/meditation.admin.controller";

export async function GET(request: NextRequest) {
  return await getMeditationResourceById(request);
}

export async function PUT(request: NextRequest) {
  return await updateMeditationResource(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteMeditationResource(request);
}
