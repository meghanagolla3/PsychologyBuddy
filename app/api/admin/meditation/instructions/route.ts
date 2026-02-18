import { NextRequest, NextResponse } from "next/server";
import {
  createMeditationInstruction,
  getMeditationInstructions,
  deleteAllMeditationInstructions,
} from "@/src/server/controllers/meditation.admin.controller";

export async function GET(request: NextRequest) {
  return await getMeditationInstructions(request);
}

export async function POST(request: NextRequest) {
  return await createMeditationInstruction(request);
}

export async function DELETE(request: NextRequest) {
  return await deleteAllMeditationInstructions(request);
}
