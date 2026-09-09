import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireVisitor, markVisitUpdatesSeen } from "@/lib/visitor";

/** Called from the My Visits page on load — clears the header's unread dot. */
export async function POST() {
  const gate = await requireVisitor();
  if (!gate.ok) return gate.response;

  await markVisitUpdatesSeen(gate.visitor.id);
  // Bust the shared layout so the navbar re-renders without the dot.
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
