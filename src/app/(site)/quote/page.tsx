import type { Metadata } from "next";
import { QuoteForm, type QuoteInitial } from "@/components/QuoteForm";
import { Breadcrumbs } from "@/components/sections";
import { ogMetadata } from "@/lib/og";
import { PLAN_INTEREST } from "@/lib/products";
import { getSite } from "@/lib/settings";
import { site } from "@/lib/site";
import { POPULAR_MAKES } from "@/lib/vehicles";

const title = "Get a Free Extended Auto Warranty Quote";
const description = "Answer a few quick questions about your car and the Alyson Auto Warranty team will contact you with plan options and prices. Free, no obligation, 30-day money-back guarantee.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/quote" },
  ...ogMetadata({ eyebrow: "Free quote", title: "Get your extended auto warranty quote", subtitle: "A few quick questions. Our team calls you with plan options and prices.", image: "/images/cta-car.webp" }, { url: "/quote", title: `${title} | ${site.name}`, description }),
};

type Search = { year?: string; make?: string; model?: string; zip?: string; plan?: string };

export default async function QuotePage({ searchParams }: { searchParams: Promise<Search> }) {
  const [sp, biz] = await Promise.all([searchParams, getSite()]);
  // Links such as /quote?plan=gold or ?year=2019&make=TOYOTA pre-fill the form.
  const initial: QuoteInitial = {};
  if (sp.year && /^\d{4}$/.test(sp.year)) initial.vehicleYear = sp.year;
  if (sp.make && POPULAR_MAKES.includes(sp.make.toUpperCase())) initial.vehicleMake = sp.make.toUpperCase();
  if (sp.model && /^[\w .&'-]{1,80}$/.test(sp.model)) initial.vehicleModel = sp.model;
  if (sp.zip && /^\d{5}$/.test(sp.zip)) initial.zip = sp.zip;
  if (sp.plan && (PLAN_INTEREST as readonly string[]).includes(sp.plan)) initial.planInterest = sp.plan as QuoteInitial["planInterest"];

  return (
    <div className="bg-mist">
      <div className="container-x pb-16 pt-8 md:pb-20">
        <Breadcrumbs crumbs={[{ name: "Get a quote", href: "/quote" }]} />
        <p className="mt-6 eyebrow">Free quote · no obligation</p>
        <div className="mt-6">
          <QuoteForm initial={initial} consentText={biz.consentText} consentVersion={biz.consentVersion} phone={biz.phone} phoneHref={biz.phoneHref} />
        </div>
      </div>
    </div>
  );
}
