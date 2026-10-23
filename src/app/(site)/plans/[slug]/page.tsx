import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, IconBadge } from "@/components/Icons";
import { PlanCard, planIcon } from "@/components/PlanCard";
import { CheckList, PageHero, QuoteBanner, SectionHeading } from "@/components/sections";
import { withHeadingIds } from "@/lib/blog";
import { ogMetadata } from "@/lib/og";
import { getPlan, getPlans } from "@/lib/plans";
import { VSC_DISCLOSURE } from "@/lib/products";
import { jsonLd } from "@/lib/security";
import { fillCompany, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const plan = await getPlan((await params).slug);
  if (!plan) return { title: "Plan not found", robots: { index: false } };
  const title = plan.seoTitle || `${plan.name} | ${site.name}`;
  const description = plan.seoDescription || fillCompany(plan.summary);
  const url = `/plans/${plan.slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    ...ogMetadata({ eyebrow: "Protected plans", title: plan.name, subtitle: plan.tagline || description, image: "/images/cta-car.webp" }, { url, title, description }),
  };
}

export default async function PlanPage({ params }: Props) {
  const { slug } = await params;
  const [plan, plans, biz] = await Promise.all([getPlan(slug), getPlans(), getSite()]);
  if (!plan) notFound();
  const others = plans.filter((p) => p.id !== plan.id && p.kind === "coverage").slice(0, 3);
  const { html } = withHeadingIds(fillCompany(plan.description));
  const quoteHref = `/quote?plan=${plan.kind === "coverage" ? plan.slug : "not_sure"}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}/plans/${plan.slug}#service`,
    name: plan.name,
    description: fillCompany(plan.summary),
    serviceType: plan.kind === "coverage" ? "Vehicle service contract" : "Prepaid vehicle maintenance plan",
    provider: { "@id": `${site.url}/#organization` },
    areaServed: "US",
    url: `${site.url}/plans/${plan.slug}`,
    offers: { "@type": "Offer", availability: "https://schema.org/InStock", priceCurrency: "USD", url: `${site.url}${quoteHref}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <PageHero
        eyebrow={plan.kind === "coverage" ? "Protected plans" : "Add-on plan"}
        title={plan.name}
        intro={plan.tagline ? `${plan.tagline}. ${fillCompany(plan.summary)}` : fillCompany(plan.summary)}
        crumbs={[{ name: "Protected plans", href: "/plans" }, { name: plan.name, href: `/plans/${plan.slug}` }]}
        media={
          <aside className="rounded-3xl bg-white p-7 text-asphalt shadow-lift">
            <div className="flex items-center gap-4">
              <IconBadge name={planIcon(plan.icon)} />
              <div>
                {plan.badge && <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-deep">{plan.badge}</p>}
                <p className="text-xl font-extrabold">{plan.name}</p>
              </div>
            </div>
            {plan.bestFor && <p className="mt-4 text-sm leading-relaxed text-road"><strong className="text-asphalt">Best for:</strong> {plan.bestFor}</p>}
            {plan.maxMileage && <p className="mt-2 text-sm text-road"><strong className="text-asphalt">Eligibility:</strong> most vehicles up to {plan.maxMileage.toLocaleString("en-US")} miles</p>}
            <div className="mt-5 flex flex-col gap-2">
              <Link href={quoteHref} className="btn-primary">Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
              <a href={biz.phoneHref} className="btn-secondary"><Icon name="phone" size={18} /> {biz.phone}</a>
            </div>
            <p className="mt-3 text-center text-xs text-road">Free quote · 30-day money-back guarantee</p>
          </aside>
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          {["Any ASE-certified repair shop", "24/7 claims support", "30-day money-back guarantee"].map((t) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-semibold">
              <Icon name="check" size={14} strokeWidth={3} className="text-line" /> {t}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="bg-white">
        <div className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_360px] md:py-20">
          <div className="min-w-0">
            <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />

            {plan.features.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-extrabold text-asphalt">What&apos;s included</h2>
                <div className="mt-5"><CheckList items={plan.features} /></div>
              </div>
            )}
            {plan.exclusions.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-extrabold text-asphalt">What&apos;s not included</h2>
                <div className="mt-5"><CheckList items={plan.exclusions} tone="muted" /></div>
              </div>
            )}
            <p className="mt-10 rounded-2xl bg-mist p-5 text-sm leading-relaxed text-road">{VSC_DISCLOSURE} The contract you receive lists the exact parts, exclusions, deductible and claim procedure, and it controls over this page.</p>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-rail p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-road">How to get this plan</p>
              <ol className="mt-4 space-y-4 text-[15px]">
                {[["Request a quote", "Tell us about your car. It takes about a minute."], ["Talk to our team", "We confirm eligibility and give you prices and terms."], ["Drive protected", "Review the contract, choose a payment option, and you're covered."]].map(([t, b], i) => (
                  <li key={t} className="flex gap-3">
                    <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-asphalt text-xs font-bold text-line">{i + 1}</span>
                    <span><span className="block font-bold text-asphalt">{t}</span><span className="text-road">{b}</span></span>
                  </li>
                ))}
              </ol>
              <Link href={quoteHref} className="btn-dark mt-5 w-full">Start my quote</Link>
            </div>
            <div className="rounded-3xl bg-brand-soft p-6 text-sm leading-relaxed text-asphalt">
              <p className="font-bold">Members save more</p>
              <p className="mt-1 text-road">Active members of AAA, AARP, PenFed Credit Union, USAA, TriCare or the VA system qualify for preferred pricing. Mention it when we call.</p>
            </div>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="bg-mist">
          <div className="container-x py-16 md:py-20">
            <SectionHeading eyebrow="Other plans" title="Compare with our other protection plans" />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {others.map((p) => <div key={p.id} className="group"><PlanCard plan={p} compact /></div>)}
            </div>
            <p className="mt-8 text-center"><Link href="/plans" className="inline-flex items-center gap-1.5 font-bold text-asphalt hover:text-brand-deep">See the full comparison <Icon name="arrow" size={18} /></Link></p>
          </div>
        </section>
      )}

      <QuoteBanner phone={biz.phone} phoneHref={biz.phoneHref} />
    </>
  );
}
