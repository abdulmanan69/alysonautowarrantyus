import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icons";
import { db } from "@/lib/db";
import { getSite } from "@/lib/settings";

export const metadata = { title: "Thanks for your request", robots: { index: false } };
export const dynamic = "force-dynamic";

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Shown after the quote form. No prices online: a member of the team calls with plan options and
// prices, and the visitor can call right away.
export default async function ThankYouPage({ params }: { params: Promise<{ id: string }> }) {
  const biz = await getSite();
  const { id } = await params;
  // Only non-sensitive fields are loaded here: this page is reachable by its link.
  const lead = await db.lead.findUnique({ where: { id }, select: { firstName: true, vehicles: { select: { year: true, make: true, model: true } } } });
  if (!lead) notFound();
  const v = lead.vehicles[0];
  const car = v ? `${v.year} ${titleCase(v.make)} ${v.model}` : "car";

  return (
    <div className="bg-mist">
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <span aria-hidden className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand text-asphalt">
          <Icon name="check" size={30} strokeWidth={2.6} />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">Thanks, {lead.firstName}. We&apos;ll contact you soon.</h1>
        <p className="mt-4 text-lg leading-relaxed text-road">
          A member of our team will call you shortly with plan options and prices for your {car}, and answer any questions you have.
        </p>
        <div className="mt-8 rounded-3xl bg-ink p-7 text-white">
          <p className="text-lg font-bold">Don&apos;t want to wait? Call us now.</p>
          <a href={biz.phoneHref} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-xl font-extrabold text-asphalt transition hover:bg-brand-hover">
            <Icon name="phone" size={20} />
            {biz.phone}
          </a>
          <p className="mt-3 text-sm text-white/60">{biz.hours}</p>
        </div>
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {[["Compare plans", "/plans", "See what Platinum, Gold and Powertrain cover."], ["Why Alyson", "/why-alyson", "24/7 support, any ASE shop, money-back guarantee."], ["Read the FAQ", "/faq", "How claims, cancellations and transfers work."]].map(([t, href, b]) => (
            <Link key={href} href={href} className="rounded-2xl border border-rail bg-white p-4 transition hover:border-brand">
              <span className="block font-bold text-asphalt">{t} →</span>
              <span className="mt-1 block text-sm text-road">{b}</span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-road">Free quote, no obligation to buy, and every plan comes with a 30-day money-back guarantee.</p>
      </div>
    </div>
  );
}
