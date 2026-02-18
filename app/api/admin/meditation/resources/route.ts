import { NextRequest, NextResponse } from "next/server";
import {
  createMeditationResource,
  getMeditationResources,
} from "@/src/server/controllers/meditation.admin.controller";

export async function GET(request: NextRequest) {
  return await getMeditationResources(request);
}

export async function POST(request: NextRequest) {
  return await createMeditationResource(request);
}
