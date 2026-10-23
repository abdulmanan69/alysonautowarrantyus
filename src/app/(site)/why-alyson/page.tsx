import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { PageHero, ProcessSection, QuoteBanner, StatsBand, WhySection } from "@/components/sections";
import { ogMetadata } from "@/lib/og";
import { fillCompany, getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

const title = `Why Choose ${site.name}`;
const description = "24/7 live claims support, free roadside assistance, repairs at any ASE-certified shop, a 30-day money-back guarantee, affordable three-tier plans and preferred pricing for AAA, AARP, USAA and VA members.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/why-alyson" },
  ...ogMetadata({ eyebrow: "Why Alyson", title: "Real people, real protection, 24/7", subtitle: "Six reasons drivers choose Alyson Auto Warranty.", image: "/images/why-us/car-warranty-agent-1024.webp" }, { url: "/why-alyson", title: `${title} | ${site.name}`, description }),
};

const MEMBERS = ["AAA", "AARP", "PenFed Credit Union", "USAA (military families)", "TriCare (active service members)", "VA system (veterans)"];

export default async function WhyPage() {
  const [{ content }, biz] = await Promise.all([getSettings(), getSite()]);
  const reasons = content.reasons.map((r) => ({ title: fillCompany(r.title), body: fillCompany(r.body) }));
  return (
    <>
      <PageHero
        eyebrow="Why Alyson"
        title={<>Real people, real protection, <span className="mark mark-dark">every step of the way</span></>}
        intro={fillCompany(content.whyIntro)}
        crumbs={[{ name: "Why Alyson", href: "/why-alyson" }]}
        media={
          <div className="relative">
            <img src="/images/why-us/car-warranty-agent-1024.webp" srcSet="/images/why-us/car-warranty-agent-640.webp 640w, /images/why-us/car-warranty-agent-1024.webp 1024w, /images/why-us/car-warranty-agent-1600.webp 1600w" sizes="(min-width: 1024px) 520px, 100vw" alt="An Alyson Auto Warranty team member helping a customer by phone" width={1024} height={683} fetchPriority="high" className="h-auto w-full rounded-[2rem] object-cover shadow-lift" />
            <div className="absolute -bottom-5 left-6 rounded-2xl bg-brand px-5 py-3 text-asphalt shadow-lift">
              <p className="text-xs font-bold uppercase tracking-[0.14em]">We never close</p>
              <p className="text-lg font-extrabold">24/7 · 365 days</p>
            </div>
          </div>
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/quote" className="btn-primary">Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
          <Link href="/plans" className="btn-ghost-light">See the plans</Link>
        </div>
      </PageHero>

      <StatsBand stats={content.stats} />

      <WhySection intro={content.whyIntro} reasons={reasons} bare />

      <section className="bg-white">
        <div className="container-x grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow">Preferred pricing for members</p>
            <h2 className="mt-3 text-3xl font-extrabold text-asphalt sm:text-4xl">Already a member? You save more.</h2>
            <p className="mt-4 text-lg leading-relaxed text-road">We&apos;ve built strong relationships with respected organizations so their members get preferred pricing. Send proof of active membership and we apply the discount to your plan.</p>
            <Link href="/contact" className="btn-dark mt-6">Ask about member pricing</Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {MEMBERS.map((m) => (
              <li key={m} className="flex items-center gap-3 rounded-2xl border border-rail bg-mist px-4 py-3.5 font-semibold text-asphalt">
                <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-asphalt"><Icon name="badge" size={16} /></span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProcessSection steps={content.process} />
      <QuoteBanner phone={biz.phone} phoneHref={biz.phoneHref} />
    </>
  );
}
