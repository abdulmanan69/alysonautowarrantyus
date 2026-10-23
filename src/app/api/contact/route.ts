import { after, NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { readPublicRequest } from "@/lib/lead-intake";
import { notifyMessage } from "@/lib/notify";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";

// Messages from /contact. Saved for the team (Admin → Messages) and announced through the alert channels.
export async function POST(req: NextRequest) {
  const request = await readPublicRequest(req, "contact");
  if (request instanceof NextResponse) return request;
  const parsed = contactSchema.safeParse(request.body);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const message = parsed.error.issues[0]?.message ?? "Please check the form.";
    return NextResponse.json({ error: field ? `${message}` : "Please check the form." }, { status: 422 });
  }
  const f = parsed.data;
  // Honeypot: bots fill it in, people never see it. Pretend it worked.
  if (f.website) return NextResponse.json({ reference: "RECEIVED" });

  const m = await db.contactMessage.create({
    data: {
      name: f.name,
      email: f.email.toLowerCase(),
      phone: f.phone,
      subject: f.subject,
      message: f.message,
      pageUrl: f.pageUrl.slice(0, 500),
      ipAddress: request.ip,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
    select: { id: true },
  });
  await audit("public", "message_received", "message", m.id, { subject: f.subject || undefined });
  after(() => notifyMessage(m.id));
  return NextResponse.json({ reference: m.id.slice(-8).toUpperCase() });
}
