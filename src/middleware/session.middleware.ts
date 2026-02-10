import { getServerSession } from "@/src/utils/session.util";
import { NextResponse } from "next/server";

export async function requireAuth(req: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return session;
}
