import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { authenticateApiKey } from "@/lib/api-keys";
import { json, leadSelect, leadView, pagination } from "@/lib/api";
import { db } from "@/lib/db";
import { STATUS_LABELS } from "@/components/admin/statuses";

export const dynamic = "force-dynamic";

/**
 * Quote requests, newest first (leads scope; read only).
 * ?status=new|contacted|quoted|sold|lost|unqualified  ?since=<ISO date>  ?page=  ?limit= (max 200)
 */
export async function GET(req: Request) {
  const caller = await authenticateApiKey(req, "leads");
  if (caller instanceof NextResponse) return caller;
  const { skip, limit, page, params } = pagination(req, 50, 200);
  const status = params.get("status") ?? "";
  const since = params.get("since") ? new Date(params.get("since")!) : null;
  const where: Prisma.LeadWhereInput = {
    ...(status && status in STATUS_LABELS ? { status } : {}),
    ...(since && !Number.isNaN(since.getTime()) ? { createdAt: { gte: since } } : {}),
  };
  const [rows, total] = await Promise.all([
    db.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit, select: leadSelect }),
    db.lead.count({ where }),
  ]);
  return json({ page, limit, total, leads: rows.map(leadView) });
}
