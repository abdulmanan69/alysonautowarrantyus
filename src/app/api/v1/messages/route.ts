import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { authenticateApiKey } from "@/lib/api-keys";
import { json, pagination } from "@/lib/api";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { MESSAGE_STATUS_LABELS } from "@/components/admin/statuses";

export const dynamic = "force-dynamic";

/**
 * Contact-form messages, newest first (leads scope; read only).
 * ?status=new|read|replied|archived  ?since=<ISO date>  ?page=  ?limit= (max 200)
 */
export async function GET(req: Request) {
  const caller = await authenticateApiKey(req, "leads");
  if (caller instanceof NextResponse) return caller;
  const { skip, limit, page, params } = pagination(req, 50, 200);
  const status = params.get("status") ?? "";
  const since = params.get("since") ? new Date(params.get("since")!) : null;
  const where: Prisma.ContactMessageWhereInput = {
    ...(status && status in MESSAGE_STATUS_LABELS ? { status } : {}),
    ...(since && !Number.isNaN(since.getTime()) ? { createdAt: { gte: since } } : {}),
  };
  const [rows, total] = await Promise.all([
    db.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit, select: { id: true, createdAt: true, status: true, name: true, email: true, phone: true, subject: true, message: true, pageUrl: true, staffNote: true, handledBy: { select: { name: true } } } }),
    db.contactMessage.count({ where }),
  ]);
  return json({ page, limit, total, messages: rows.map((m) => ({ ...m, adminUrl: `${site.url}/admin/messages?open=${m.id}` })) });
}
