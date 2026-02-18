import { NextRequest, NextResponse } from "next/server";
import {
  getInstructionsByResource,
} from "@/src/server/controllers/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getInstructionsByResource(request);
}
