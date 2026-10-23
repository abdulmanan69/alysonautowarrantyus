import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { FaqSection, PageHero, PlansSection, QuoteBanner, SectionHeading } from "@/components/sections";
import { ogMetadata } from "@/lib/og";
import { getPlans } from "@/lib/plans";
import { jsonLd } from "@/lib/security";
import { fillCompany, getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

const title = "Extended Auto Warranty Plans";
const description = "Compare Alyson Auto Warranty protection plans: Platinum (bumper-to-bumper style), Gold (comprehensive listed coverage), Powertrain (engine and transmission up to 200,000 miles) and Prepaid Maintenance.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/plans" },
  ...ogMetadata({ eyebrow: "Protected plans", title: "Coverage that fits your car and your budget", subtitle: "Platinum, Gold and Powertrain protection plus prepaid maintenance.", image: "/images/cta-car.webp" }, { url: "/plans", title: `${title} | ${site.name}`, description }),
};

// Systems compared in the table, and which plan tier first includes them.
const COMPARE: { label: string; tiers: ("powertrain" | "gold" | "platinum")[] }[] = [
  { label: "Engine, transmission and drive axle", tiers: ["powertrain", "gold", "platinum"] },
  { label: "24/7 roadside assistance and towing", tiers: ["powertrain", "gold", "platinum"] },
  { label: "Air conditioning and cooling system", tiers: ["gold", "platinum"] },
  { label: "Steering and suspension", tiers: ["gold", "platinum"] },
  { label: "Brake system", tiers: ["gold", "platinum"] },
  { label: "Electrical and fuel systems", tiers: ["gold", "platinum"] },
  { label: "Hi-tech electronics", tiers: ["platinum"] },
  { label: "Seals and gaskets (all covered parts)", tiers: ["platinum"] },
  { label: "Power windows, locks and seats", tiers: ["platinum"] },
  { label: "Rental car reimbursement", tiers: ["platinum"] },
];

export default async function PlansPage() {
  const [plans, { content }, biz] = await Promise.all([getPlans(), getSettings(), getSite()]);
  const coverage = plans.filter((p) => p.kind === "coverage");
  const faqs = content.faqs.slice(0, 5).map((f, i) => ({ q: fillCompany(f.q), a: fillCompany(f.a), call: i === 0 }));
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} protection plans`,
    itemListElement: plans.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Service", name: p.name, description: fillCompany(p.summary), url: `${site.url}/plans/${p.slug}`, provider: { "@id": `${site.url}/#organization` }, serviceType: "Vehicle service contract", areaServed: "US" },
    })),
  };
  const col = (slug: string) => coverage.find((p) => p.slug === slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <PageHero
        eyebrow="Protected plans"
        title={<>Coverage that fits your car <span className="mark mark-dark">and your budget</span></>}
        intro="Three tiers of protection, from the essentials to bumper-to-bumper style coverage, plus a prepaid maintenance add-on. Every plan is backed by established providers and a 30-day money-back guarantee."
        crumbs={[{ name: "Protected plans", href: "/plans" }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/quote" className="btn-primary">Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
          <a href={biz.phoneHref} className="btn-ghost-light"><Icon name="phone" size={18} /> {biz.phone}</a>
        </div>
      </PageHero>

      <PlansSection plans={plans} bare />

      {coverage.length >= 2 && (
        <section className="bg-mist">
          <div className="container-x py-16 md:py-20">
            <SectionHeading eyebrow="Compare at a glance" title="Which systems each plan protects" intro="A simplified overview. The exact parts, exclusions and deductible for each plan are listed in its contract." />
            <div className="mt-10 overflow-x-auto rounded-3xl border border-rail bg-white shadow-card">
              <table className="w-full min-w-[640px] text-left text-[15px]">
                <thead>
                  <tr className="border-b border-rail">
                    <th scope="col" className="px-5 py-4 text-sm font-semibold uppercase tracking-wide text-road">System</th>
                    {(["powertrain", "gold", "platinum"] as const).filter(col).map((slug) => (
                      <th key={slug} scope="col" className="px-5 py-4 text-center">
                        <Link href={`/plans/${slug}`} className="font-extrabold text-asphalt hover:text-brand-deep">{col(slug)!.name}</Link>
                        {col(slug)!.maxMileage && <span className="block text-xs font-medium text-road">up to {col(slug)!.maxMileage!.toLocaleString("en-US")} mi</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rail">
                  {COMPARE.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="px-5 py-3.5 font-medium text-asphalt">{row.label}</th>
                      {(["powertrain", "gold", "platinum"] as const).filter(col).map((slug) => (
                        <td key={slug} className="px-5 py-3.5 text-center">
                          {row.tiers.includes(slug) ? (
                            <span aria-label="Included" className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-brand text-asphalt"><Icon name="check" size={14} strokeWidth={3} /></span>
                          ) : (
                            <span aria-label="Not included" className="mx-auto block h-1.5 w-5 rounded-full bg-rail" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-center text-sm text-road">Optional hi-tech and commercial-use add-ons are available on the Gold plan. Ask our team which options fit your car.</p>
          </div>
        </section>
      )}

      <FaqSection faqs={faqs} phone={biz.phone} phoneHref={biz.phoneHref} title="Plan questions, answered" more />
      <QuoteBanner phone={biz.phone} phoneHref={biz.phoneHref} />
    </>
  );
}
