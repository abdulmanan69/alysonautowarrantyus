import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { leadWhere } from "@/lib/admin-leads";
import { requireAdmin } from "@/lib/admin-guard";
import { planInterestLabel } from "@/lib/products";

export const runtime = "nodejs";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Prevent spreadsheet formula injection and escape quotes.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

// Accepts the same ?q=, ?status=, ?plan= and ?source= filters as the admin leads page.
export async function GET(req: Request) {
  const me = await requireAdmin("admin"); // full PII export: admins and owners only
  const params = new URL(req.url).searchParams;
  const filters = { q: params.get("q") ?? undefined, status: params.get("status") ?? undefined, plan: params.get("plan") ?? undefined, source: params.get("source") ?? undefined };
  const leads = await db.lead.findMany({ where: leadWhere(filters), orderBy: { createdAt: "desc" }, take: 5000, include: { vehicles: { take: 1 }, assignedTo: { select: { name: true } } } });
  const header = ["created_at", "id", "status", "source", "plan_interest", "first_name", "last_name", "email", "phone", "state", "zip", "vehicle_year", "vehicle_make", "vehicle_model", "mileage_up_to", "factory_warranty", "assigned_to", "utm_source", "utm_medium", "utm_campaign", "do_not_contact"];
  const rows = leads.map((l) => {
    const v = l.vehicles[0];
    return [
      l.createdAt.toISOString(), l.id, l.status, l.source, planInterestLabel(l.planInterest), l.firstName, l.lastName, l.email, l.phone, l.state, l.zip,
      v?.year, v?.make, v?.model, v?.mileage, v?.factoryWarranty, l.assignedTo?.name, l.utmSource, l.utmMedium, l.utmCampaign, l.doNotContact ? "yes" : "no",
    ];
  });
  await audit(me.email, "export_csv", "lead", "*", { count: leads.length, ...filters });
  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="quote-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
