import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-keys";
import { json } from "@/lib/api";
import { getAllPlans } from "@/lib/plans";
import { fillCompany } from "@/lib/settings";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Protection plans, including hidden ones (content scope; read only). Edit them in Admin → Plans. */
export async function GET(req: Request) {
  const caller = await authenticateApiKey(req, "content");
  if (caller instanceof NextResponse) return caller;
  const plans = await getAllPlans();
  return json({
    plans: plans.map((p) => ({ ...p, summary: fillCompany(p.summary), description: fillCompany(p.description), url: `${site.url}/plans/${p.slug}`, adminUrl: `${site.url}/admin/plans/${p.id}` })),
  });
}
