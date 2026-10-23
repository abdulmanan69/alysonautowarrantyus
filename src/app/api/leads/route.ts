import { after, NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { contactFlags, readPublicRequest, recentDuplicate, splitName } from "@/lib/lead-intake";
import { notifyLead } from "@/lib/notify";
import { getSettings, getSite } from "@/lib/settings";
import { stateFromZip } from "@/lib/states";
import { digitsOnly, leadSubmissionSchema, quickSubmissionSchema } from "@/lib/validation";

export const runtime = "nodejs";

// Quote requests from the four-step form (/quote) and the short homepage form. Both create a Lead;
// the visitor then sees /quote/thank-you/[id] and the team calls with plan options and prices.
export async function POST(req: NextRequest) {
  const request = await readPublicRequest(req, "lead");
  if (request instanceof NextResponse) return request;
  const { body, ip } = request;

  const quick = (body as { kind?: string } | null)?.kind === "quick";
  const parsed = quick ? quickSubmissionSchema.safeParse(body) : leadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }
  const { tracking, trustedFormCertUrl, pageUrl, consentVersion, website } = parsed.data;
  // Hidden "website" field: people never see it, bots fill it in.
  if (website) return NextResponse.json({ error: "Validation failed" }, { status: 422 });

  // Consent text comes from the server config, never from the browser.
  const site = await getSite();
  if (consentVersion !== site.consentVersion) {
    return NextResponse.json({ error: "Consent version mismatch. Please reload the page." }, { status: 409 });
  }

  // Normalise both form shapes into one lead.
  let person: { firstName: string; lastName: string; email: string; phone: string; zip: string; state: string; planInterest: string };
  let vehicle: { year: number; make: string; model: string; mileage: number | null; ownership: string | null; factoryWarranty: string | null };
  if (parsed.data.kind === "quick") {
    const f = parsed.data.form;
    const state = stateFromZip(f.zip);
    if (!state) return NextResponse.json({ error: "We couldn't match that ZIP code to a state. Check it and try again." }, { status: 422 });
    person = { ...splitName(f.name), email: f.email.toLowerCase(), phone: digitsOnly(f.phone).replace(/^1(?=\d{10}$)/, ""), zip: f.zip, state, planInterest: "not_sure" };
    vehicle = { year: Number(f.vehicleYear), make: f.vehicleMake, model: f.vehicleModel, mileage: null, ownership: null, factoryWarranty: null };
  } else {
    const f = parsed.data.form;
    person = { firstName: f.firstName, lastName: f.lastName, email: f.email.toLowerCase(), phone: digitsOnly(f.phone).replace(/^1(?=\d{10}$)/, ""), zip: f.zip, state: f.state, planInterest: f.planInterest };
    vehicle = { year: Number(f.vehicleYear), make: f.vehicleMake, model: f.vehicleModel, mileage: Number(f.mileage), ownership: f.ownership, factoryWarranty: f.factoryWarranty };
  }
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  const existing = await recentDuplicate(person.phone, person.email, vehicle);
  if (existing) {
    await audit("api", "duplicate_submission", "lead", existing);
    return NextResponse.json({ id: existing, duplicate: true });
  }

  const { legal } = await getSettings();
  const { doNotContact, doNotSell } = await contactFlags(person.email, person.phone, legal.honorGpc);

  const lead = await db.lead.create({
    data: {
      ...person,
      source: quick ? "hero" : "quote",
      ...tracking,
      ipAddress: ip,
      userAgent,
      doNotContact,
      doNotSell,
      trustedFormCertUrl: trustedFormCertUrl || null,
      vehicles: { create: vehicle },
      consent: { create: { consentText: site.consentText, consentVersion: site.consentVersion, ipAddress: ip, userAgent, pageUrl } },
    },
  });

  await audit("public", "lead_created", "lead", lead.id, { state: lead.state, source: lead.source, utm: lead.utmSource ?? undefined });
  after(() => notifyLead(lead.id));
  return NextResponse.json({ id: lead.id });
}
