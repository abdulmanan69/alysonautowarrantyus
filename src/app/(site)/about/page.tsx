import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { PageHero, QuoteBanner, StatsBand } from "@/components/sections";
import { livePosts } from "@/lib/blog";
import { db } from "@/lib/db";
import { ogMetadata } from "@/lib/og";
import { jsonLd } from "@/lib/security";
import { fillCompany, getSettings, getSite } from "@/lib/settings";
import { site } from "@/lib/site";

const title = `About ${site.name}`;
const description = `Who ${site.name} is, the vehicle service contracts (extended auto warranties) we offer, how claims work, how we research our guides and how we are paid.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  ...ogMetadata({ eyebrow: "About us", title, subtitle: "Customer first, claims handled swiftly and fairly.", image: "/images/why-us/car-warranty-agent-1024.webp" }, { url: "/about", title: `${title} | ${site.name}`, description }),
};

// Only facts the site can stand behind: what it does, how claims work, how content is made,
// how it is paid, and how to reach the business (from Settings).
export default async function AboutPage() {
  const [biz, { content }, posts] = await Promise.all([getSite(), getSettings(), db.post.count({ where: livePosts() })]);
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${site.url}/about#webpage`,
    url: `${site.url}/about`,
    name: title,
    description,
    about: { "@id": `${site.url}/#organization` },
    publisher: { "@id": `${site.url}/#organization` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <PageHero
        eyebrow="About us"
        title={<>{fillCompany(content.about.title).replace(/ is here for you$/, "")} is <span className="mark mark-dark">here for you</span></>}
        intro={fillCompany(content.about.body)}
        crumbs={[{ name: "About", href: "/about" }]}
        media={<img src="/images/about/team-car.webp" alt={`${site.name} representative with a customer`} width={750} height={610} fetchPriority="high" className="h-auto w-full rounded-[2rem] object-cover shadow-lift" />}
      />
      <StatsBand stats={content.stats} />
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_320px] md:py-20">
        <div className="post-content">
          <h2>What we do</h2>
          <p>
            {site.name} offers <strong>vehicle service contracts</strong>, often called extended auto warranties. When you <Link href="/quote">request a quote</Link>, our team contacts you with prices for the plans your car qualifies for, from <Link href="/plans/powertrain">Powertrain</Link> to <Link href="/plans/platinum">Platinum</Link> protection, and helps you choose. Each contract is backed and administered by an established provider, which handles covered repairs under the contract&apos;s terms.
          </p>
          <p>
            A vehicle service contract is not insurance. Car insurance pays for damage after an accident, theft or weather; a service contract may pay for eligible repairs when the parts it lists break down. We explain exactly what each plan includes and excludes, every plan comes with a 30-day money-back guarantee, and there is never an obligation to buy.
          </p>

          <h2>How claims work</h2>
          <p>
            When a covered part fails, take your car to any ASE-certified repair facility and call our claims line before work begins. We review the diagnosis, authorize the covered repair and pay the shop under your contract; you pay your deductible. Read the full process on our <Link href="/claims">Claims</Link> page.
          </p>

          <h2>How we create our guides</h2>
          <p>
            Our <Link href="/blog">blog</Link> ({posts} {posts === 1 ? "article" : "articles"}) and our <Link href="/repair-costs">car repair cost guide</Link> are written by the {site.name} team. We base factual claims on established sources, such as the Federal Trade Commission, repair-cost studies and recognized consumer organizations, and we link to those sources so you can check them. If you spot something that looks wrong or out of date, email <a href={`mailto:${biz.email}`}>{biz.email}</a> and we will check it.
          </p>

          <h2>How we are paid</h2>
          <p>
            Our quotes and guides are free to use. We earn money when you buy a vehicle service contract through us. That never changes what our guides say about how these contracts work, and our <Link href="/privacy">Privacy Policy</Link> explains how your information is used and how to <Link href="/do-not-sell">opt out of its sale or sharing</Link>.
          </p>

          <h2>Contact us</h2>
          <p>
            Existing customers can reach support at <a href={biz.supportPhoneHref}>{biz.supportPhone}</a>; new customers can call <a href={biz.phoneHref}>{biz.phone}</a>. You can also email <a href={`mailto:${biz.email}`}>{biz.email}</a> or write to {biz.addressLine}. You can also use our <Link href="/contact">contact form</Link> and read our <Link href="/terms">Terms and Conditions</Link>.
          </p>
        </div>
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-ink p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-line">Customer support</p>
            <a href={biz.supportPhoneHref} className="mt-2 block text-2xl font-extrabold hover:text-line">{biz.supportPhone}</a>
            <p className="mt-1 text-sm text-white/70">{biz.hours}</p>
            <p className="mt-5 border-t border-white/10 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-line">New customers &amp; quotes</p>
            <a href={biz.phoneHref} className="mt-1 block text-lg font-extrabold hover:text-line">{biz.phone}</a>
            <Link href="/quote" className="btn-primary mt-5 w-full">Get my free quote <Icon name="arrow" size={18} strokeWidth={2.4} /></Link>
          </div>
          <ul className="space-y-2 rounded-3xl border border-rail p-6 text-sm">
            {content.about.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 font-semibold text-asphalt">
                <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-asphalt"><Icon name="check" size={11} strokeWidth={3} /></span>
                {fillCompany(p)}
              </li>
            ))}
          </ul>
        </aside>
      </section>
      <QuoteBanner phone={biz.phone} phoneHref={biz.phoneHref} />
    </>
  );
}
