import Link from "next/link";
import { PostCard } from "@/components/blog/PostCard";
import { CursorGlow } from "@/components/CursorGlow";
import { CustomerReviews } from "@/components/CustomerReviews";
import { HeroQuoteForm } from "@/components/HeroQuoteForm";
import { HeroSlides } from "@/components/HeroSlides";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { AboutSection, FaqSection, PlansSection, ProcessSection, QuoteBanner, RepairCostsSection, SectionHeading, ServicesSection, StatsBand, VehiclesSection, WhySection } from "@/components/sections";
import { cardSelect, livePosts } from "@/lib/blog";
import { db } from "@/lib/db";
import { getPlans } from "@/lib/plans";
import { fillCompany, getSettings, getSite } from "@/lib/settings";

/** Underlines the last three words of the headline with the hand-drawn yellow stroke. */
function Marked({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 4) return <>{text}</>;
  const head = words.slice(0, -3).join(" ");
  const tail = words.slice(-3).join(" ");
  return (
    <>
      {head} <span className="underline-draw">{tail}</span>
    </>
  );
}

export default async function Home() {
  const [{ content }, biz, plans, posts] = await Promise.all([
    getSettings(),
    getSite(),
    getPlans(),
    db.post.findMany({ where: livePosts(), orderBy: { publishedAt: "desc" }, take: 3, select: cardSelect }),
  ]);
  const faqs = content.faqs.slice(0, 6).map((f, i) => ({ q: fillCompany(f.q), a: fillCompany(f.a), call: i === 0 }));
  const reasons = content.reasons.map((r) => ({ title: fillCompany(r.title), body: fillCompany(r.body) }));

  return (
    <>
      {/* Hero: photo slideshow behind the headline and the short quote form. */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <HeroSlides />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(11,12,15,0.88)_0%,rgba(11,12,15,0.6)_55%,rgba(11,12,15,0.35)_100%)]" />
        <CursorGlow />
        <div className="container-x grid items-center gap-10 py-16 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:py-24">
          <div>
            <p className="hero-rise eyebrow-light">{fillCompany(content.hero.eyebrow)}</p>
            <h1 style={{ animationDelay: "80ms" }} className="hero-rise mt-4 max-w-xl text-4xl font-extrabold leading-[1.06] sm:text-5xl md:text-[3.75rem]">
              <Marked text={fillCompany(content.hero.title)} />
            </h1>
            <p className="hero-rise mt-5 max-w-lg text-lg leading-relaxed text-white/80" style={{ animationDelay: "160ms" }}>
              {fillCompany(content.hero.subtitle)}
            </p>
            <ul className="hero-rise mt-7 space-y-2.5" style={{ animationDelay: "240ms" }}>
              {content.hero.bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 font-semibold">
                  <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-asphalt"><Icon name="check" size={13} strokeWidth={3} /></span>
                  {fillCompany(b)}
                </li>
              ))}
            </ul>
            <div className="hero-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "320ms" }}>
              <Link href="/plans" className="btn-ghost-light">Compare plans</Link>
              <a href={biz.phoneHref} className="btn-ghost-light"><Icon name="phone" size={18} /> {biz.phone}</a>
            </div>
          </div>
          <div className="hero-rise relative lg:pl-4" style={{ animationDelay: "200ms" }}>
            <HeroQuoteForm consentText={biz.consentText} consentVersion={biz.consentVersion} />
          </div>
        </div>
        <div aria-hidden className="lane lane-move h-2.5 w-full" />
      </section>

      <StatsBand stats={content.stats} />

      <ServicesSection services={content.services} />

      <AboutSection about={content.about} phone={biz.phone} phoneHref={biz.phoneHref} />

      <PlansSection plans={plans} intro="Three coverage tiers, backed and administered by established providers, plus a prepaid maintenance add-on. Every plan comes with a 30-day money-back guarantee." />

      <VehiclesSection />

      <ProcessSection steps={content.process} />

      <RepairCostsSection costs={content.repairCosts} />

      <WhySection intro={content.whyIntro} reasons={reasons} />

      <CustomerReviews />

      {posts.length > 0 && (
        <section className="bg-white">
          <div className="container-x py-16 md:py-20">
            <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading eyebrow="Industry trends and insights" title="Latest news & insights" align="left" />
              <Link href="/blog" className="inline-flex items-center gap-1.5 font-bold text-asphalt hover:text-brand-deep">All articles <Icon name="arrow" size={18} /></Link>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}

      <FaqSection faqs={faqs} phone={biz.phone} phoneHref={biz.phoneHref} more={content.faqs.length > 6} />

      <QuoteBanner phone={biz.phone} phoneHref={biz.phoneHref} />
    </>
  );
}
