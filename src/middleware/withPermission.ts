import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { extractUserPermissions } from "@/src/lib/permissions";

export function withPermission(requiredPermission: string, handler: Function) {
  return async (req: Request, context: any) => {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPermissions = extractUserPermissions(user);

    if (!userPermissions.includes(requiredPermission)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, context, user);
  };
}
