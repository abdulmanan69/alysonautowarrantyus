import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin-guard";
import { findMessages, findPerson, mask, normalizeIdentity } from "@/lib/privacy";

export const runtime = "nodejs";

// Everything held about one person, for "right to know" / data-access requests.
export async function GET(req: Request) {
  const me = await requireAdmin("admin");
  const params = new URL(req.url).searchParams;
  const { email, phone } = normalizeIdentity(params.get("email") ?? "", params.get("phone") ?? "");
  if (!email && !phone) return new Response("Enter an email or phone", { status: 400 });

  const [leads, messages] = await Promise.all([findPerson(email, phone), findMessages(email, phone)]);
  await audit(me.email, "privacy_export", "person", mask(email, phone), { leads: leads.length, messages: messages.length });
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), email: email || null, phone: phone || null, quoteRequests: leads, contactMessages: messages }, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="personal-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
