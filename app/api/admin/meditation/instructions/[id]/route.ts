import { NextRequest, NextResponse } from "next/server";
import {
  getMeditationInstructionById,
  updateMeditationInstruction,
  deleteMeditationInstruction,
} from "@/src/server/controllers/meditation.admin.controller";

export async function GET(request: NextRequest) {
  return await getMeditationInstructionById(request);
}

export async function PUT(request: NextRequest) {
  return await updateMeditationInstruction(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteMeditationInstruction(request);
}
