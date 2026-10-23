"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";

const SUBJECTS = ["Get a quote", "Question about a plan", "Claims", "Billing or my contract", "Partnership", "Something else"];

/** Contact page form: posts to /api/contact and shows a confirmation in place. */
export function ContactForm({ phone }: { phone: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ reference: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          phone: f.get("phone") ?? "",
          subject: f.get("subject") ?? "",
          message: f.get("message"),
          website: f.get("website") ?? "",
          pageUrl: window.location.href,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { reference?: string; error?: string };
      if (!res.ok || !json.reference) throw new Error(json.error || "Something went wrong. Please try again.");
      setDone({ reference: json.reference });
      const w = window as unknown as { dataLayer?: unknown[] };
      w.dataLayer?.push({ event: "contact_submitted" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="rounded-3xl bg-emerald-50 p-8 text-center">
        <span aria-hidden className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white"><Icon name="check" size={26} strokeWidth={2.6} /></span>
        <h2 className="mt-5 text-2xl font-extrabold text-asphalt">Message received</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-road">Thanks for reaching out. A member of our team will reply during business hours, usually the same day.</p>
        <p className="mt-5 text-sm text-road">Reference: <strong className="font-mono text-asphalt">{done.reference}</strong> · Need help now? Call {phone}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor="c-name" className="label">Full name</label><input id="c-name" name="name" required maxLength={120} autoComplete="name" className="input" /></div>
        <div><label htmlFor="c-email" className="label">Email</label><input id="c-email" name="email" type="email" required maxLength={200} autoComplete="email" className="input" /></div>
        <div><label htmlFor="c-phone" className="label">Phone <span className="font-normal text-road">(optional)</span></label><input id="c-phone" name="phone" type="tel" maxLength={30} autoComplete="tel" className="input" /></div>
        <div>
          <label htmlFor="c-subject" className="label">Subject</label>
          <select id="c-subject" name="subject" defaultValue="" className="input">
            <option value="">Choose one</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea id="c-message" name="message" required minLength={10} maxLength={4000} rows={5} className="input h-auto py-3" placeholder="Tell us about your car and how we can help." />
      </div>
      {/* Honeypot for bots: hidden from people and screen readers. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {error && <p role="alert" className="error">{error}</p>}
      <button disabled={busy} className="btn-primary w-full sm:w-auto">{busy ? "Sending…" : "Send message"}{!busy && <Icon name="arrow" size={18} strokeWidth={2.4} />}</button>
      <p className="text-xs leading-relaxed text-road">By sending this message you agree to our <a href="/privacy" className="font-semibold text-brand-deep underline-offset-2 hover:underline">Privacy Policy</a>. We only use your details to answer you.</p>
    </form>
  );
}
