import { auth } from "@/auth";
import { NextResponse } from "next/server";

export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

/**
 * Ensures the current request is authenticated and, optionally, that the
 * user's role is one of `roles`. Returns either the session or a ready-to
 * return NextResponse (401/403) — callers should check the discriminant.
 */
export async function requireAdmin(roles?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (roles && !roles.includes(session.user.role)) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, session };
}
