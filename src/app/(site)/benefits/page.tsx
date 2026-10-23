import type { Metadata } from "next";
import Link from "next/link";
import { Icon, IconBadge, type IconName } from "@/components/Icons";
import { PageHero, PlansSection, QuoteBanner, SectionHeading } from "@/components/sections";
import { ogMetadata } from "@/lib/og";
import { getPlans } from "@/lib/plans";
import { fillCompany, getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

const title = "Extended Auto Warranty Benefits";
const description = "What you get with an Alyson Auto Warranty plan: free roadside assistance, repairs at any ASE-certified facility, a 30-day money-back guarantee, affordable tiered plans and preferred member pricing.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/benefits" },
  ...ogMetadata({ eyebrow: "Benefits", title: "More than a standard warranty", subtitle: "Protection and financial security long after the factory warranty ends.", image: "/images/parts/transmission.webp" }, { url: "/benefits", title: `${title} | ${site.name}`, description }),
};

const ICONS: IconName[] = ["tow", "wrench", "refund", "dollar", "badge", "headset"];

export default async function BenefitsPage() {
  const [{ content }, plans, biz] = await Promise.all([getSettings(), getPlans(), getSite()]);
  // The benefits page shows the same reasons as "Why Alyson", minus the first (24/7 response), which has its own callout here.
  const benefits = content.reasons.slice(1).map((r) => ({ title: fillCompany(r.title), body: fillCompany(r.body) }));
  return (
    <>
      <PageHero
        eyebrow="Alyson benefits"
        title={<>{site.name} provides <span className="mark mark-dark">real benefits</span></>}
        intro={fillCompany(content.benefitsIntro)}
        crumbs={[{ name: "Benefits", href: "/benefits" }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/quote" className="btn-primary">Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
          <a href={biz.phoneHref} className="btn-ghost-light"><Icon name="phone" size={18} /> {biz.phone}</a>
        </div>
      </PageHero>

      <section className="bg-white">
        <div className="container-x py-16 md:py-20">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl bg-ink p-8 text-white">
              <IconBadge name="headset" tone="brand" />
              <h2 className="mt-5 text-2xl font-extrabold">Immediate 24/7 response</h2>
              <p className="mt-3 leading-relaxed text-white/75">{fillCompany(content.reasons[0]?.body ?? "")}</p>
              <a href={biz.phoneHref} className="mt-6 inline-flex items-center gap-2 text-xl font-extrabold text-line hover:underline"><Icon name="phone" size={20} /> {biz.phone}</a>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {benefits.slice(0, 2).map((b, i) => (
                <article key={b.title} className="rounded-3xl border border-rail p-6">
                  <IconBadge name={ICONS[i]} tone="soft" size={44} />
                  <h3 className="mt-4 text-lg font-extrabold text-asphalt">{b.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-road">{b.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {benefits.slice(2).map((b, i) => (
              <article key={b.title} className="rounded-3xl border border-rail p-6">
                <IconBadge name={ICONS[i + 2] ?? "shield"} tone="soft" size={44} />
                <h3 className="mt-4 text-lg font-extrabold text-asphalt">{b.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-road">{b.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist">
        <div className="container-x py-16 md:py-20">
          <SectionHeading eyebrow="What's covered" title="Pick the level of protection you need" intro="Why pay for services you may not need? Three tiers let you match coverage to your car, your mileage and your budget." />
        </div>
      </section>
      <PlansSection plans={plans} bare />
      <QuoteBanner phone={biz.phone} phoneHref={biz.phoneHref} />
    </>
  );
}
