import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-keys";
import { apiError, json, leadSelect, leadView } from "@/lib/api";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** One quote request with its notes and follow-ups (leads scope; read only). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = await authenticateApiKey(req, "leads");
  if (caller instanceof NextResponse) return caller;
  const { id } = await params;
  const lead = await db.lead.findUnique({
    where: { id },
    select: {
      ...leadSelect,
      notes: { orderBy: { createdAt: "desc" }, select: { createdAt: true, body: true, author: { select: { name: true } } } },
      tasks: { orderBy: { dueAt: "asc" }, select: { title: true, dueAt: true, doneAt: true, assignee: { select: { name: true } } } },
    },
  });
  if (!lead) return apiError(404, "Quote request not found");
  return json({ lead: leadView(lead) });
}
