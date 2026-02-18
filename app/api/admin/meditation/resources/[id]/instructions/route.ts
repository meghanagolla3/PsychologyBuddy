import { NextRequest, NextResponse } from "next/server";
import {
  getInstructionsByResource,
} from "@/src/server/controllers/meditation.admin.controller";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Update the query to use the resourceId parameter
  const url = new URL(request.url);
  url.searchParams.set('resourceId', params.id);
  
  // Create a new NextRequest with the updated URL
  const newRequest = new NextRequest(url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  
  return await getInstructionsByResource(newRequest);
}
