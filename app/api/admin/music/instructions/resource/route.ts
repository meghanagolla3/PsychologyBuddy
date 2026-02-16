import { NextRequest, NextResponse } from "next/server";
import {
  getInstructionsByResource,
} from "@/src/components/server/content/selfhelptools/music/music.admin.controller";

export async function GET(request: NextRequest) {
  return await getInstructionsByResource(request);
}
