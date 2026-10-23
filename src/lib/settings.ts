import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "./db";
import { DEFAULT_PRIVACY_HTML, DEFAULT_TERMS_HTML } from "./legal-templates";
import { formatAddress, site, telHref } from "./site";

export type TrackingSettings = { ga4Id: string; gtmId: string; metaPixelId: string };
export type VerificationSettings = { google: string; bing: string; yandex: string; meta: string };
/** IndexNow tells Bing, Yandex and other engines about new or changed pages right away. */
export type IndexNowSettings = { enabled: boolean; key: string; lastSubmitted: string; lastResult: string };
/** AI search: which AI crawlers may read the site, and the /llms.txt summary. */
export type AiSettings = { allowSearchBots: boolean; allowTrainingBots: boolean; llmsTxt: boolean };
export type SeoSettings = { title: string; description: string };

export type BusinessSettings = {
  phone: string;
  email: string;
  claimsEmail: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  hours: string;
  agencyLegalName: string;
  licenseNote: string;
  consentText: string;
  consentVersion: string; // changes automatically whenever consentText changes
  social: { facebook: string; instagram: string; linkedin: string; x: string; youtube: string };
};

export type ReviewItem = { name: string; location: string; date: string; rating: number; text: string; title?: string };
export type ReviewTheme = "plain" | "trustpilot" | "google";
export type ContentSettings = {
  hero: { eyebrow: string; title: string; subtitle: string; bullets: string[] };
  stats: { value: string; label: string }[];
  about: { eyebrow: string; title: string; body: string; points: string[] };
  services: { title: string; body: string }[];
  process: { title: string; body: string }[];
  whyIntro: string;
  reasons: { title: string; body: string }[];
  benefitsIntro: string;
  claims: { intro: string; hours: string; maintenanceIntro: string; maintenanceHours: string; note: string };
  faqs: { q: string; a: string }[];
  repairCosts: Record<string, string>; // part name -> price shown in the car diagram
  reviews: {
    theme?: ReviewTheme; // look of the reviews section
    autoplaySeconds?: number; // seconds between slides; 0 = don't move
    summary: { platform: string; rating: number; count: number; url: string } | null;
    items: ReviewItem[];
    award: { text: string; url: string } | null;
  };
};

/** One menu entry. Header items may have one level of children (a dropdown). */
export type MenuItem = { id: string; label: string; href: string; newTab?: boolean; description?: string; children?: MenuItem[] };
export type FooterColumn = { id: string; title: string; links: MenuItem[] };
export type NavigationSettings = {
  links: MenuItem[]; // header menu, left to right
  showPhone: boolean;
  ctaLabel: string; // yellow button; empty = hidden
  ctaHref: string;
  sticky: boolean; // header stays at the top while scrolling
  topBar: boolean; // yellow strip above the header with address, phone and hours
  announcement: { enabled: boolean; text: string; linkLabel: string; href: string };
  footerColumns: FooterColumn[];
};

export type LegalSettings = {
  privacyHtml: string;
  termsHtml: string;
  privacyUpdated: string; // YYYY-MM-DD, set automatically when the text changes
  termsUpdated: string;
  privacyEmail: string; // empty = business email
  privacyPhone: string; // empty = business phone
  mailingAddress: string; // empty = business address
  governingState: string;
  honorGpc: boolean;
  responseDays: number;
  confirmByEmail: boolean;
  reviewed: boolean; // an attorney has approved both documents
};

export type BlogSettings = {
  title: string;
  intro: string;
  postsPerPage: number;
  writersCanPublish: boolean;
  showQuoteCta: boolean;
  ctaTitle: string;
  ctaText: string;
};

export type NotificationSettings = {
  emailTo: string; // comma-separated
  smsTo: string; // comma-separated, E.164 e.g. +15125550100
  webhookUrl: string; // Slack, Teams, Google Chat or any https webhook
  onNewLead: boolean;
  onNewMessage: boolean;
};

export const DEFAULTS = {
  tracking: { ga4Id: "", gtmId: "", metaPixelId: "" } as TrackingSettings,
  verification: { google: "", bing: "", yandex: "", meta: "" } as VerificationSettings,
  indexnow: { enabled: false, key: "", lastSubmitted: "", lastResult: "" } as IndexNowSettings,
  ai: { allowSearchBots: true, allowTrainingBots: true, llmsTxt: true } as AiSettings,
  seo: { title: "", description: "" } as SeoSettings,
  business: {
    phone: site.phone,
    email: site.email,
    claimsEmail: site.claimsEmail,
    street: site.address.street,
    city: site.address.city,
    state: site.address.state,
    zip: site.address.zip,
    hours: site.hours,
    agencyLegalName: site.agencyLegalName,
    licenseNote: site.licenseNote,
    consentText: site.consentText,
    consentVersion: site.consentVersion,
    social: { ...site.social },
  } as BusinessSettings,
  notifications: { emailTo: "", smsTo: "", webhookUrl: "", onNewLead: true, onNewMessage: true } as NotificationSettings,
  navigation: {
    links: [
      {
        id: "plans",
        label: "Protected Plans",
        href: "/plans",
        children: [
          { id: "p-platinum", label: "Platinum Protection", href: "/plans/platinum", description: "Bumper-to-bumper style coverage for nearly every part." },
          { id: "p-gold", label: "Gold Protection", href: "/plans/gold", description: "Comprehensive coverage of major systems, listed part by part." },
          { id: "p-powertrain", label: "Powertrain Protection", href: "/plans/powertrain", description: "Engine, transmission and drivetrain for older, higher-mileage cars." },
          { id: "p-maintenance", label: "Prepaid Maintenance", href: "/plans/prepaid-maintenance", description: "Oil changes, brakes, battery and cooling system for the first year." },
        ],
      },
      { id: "why", label: "Why Alyson", href: "/why-alyson" },
      { id: "benefits", label: "Benefits", href: "/benefits" },
      { id: "claims", label: "Claims", href: "/claims" },
      { id: "faq", label: "FAQ", href: "/faq" },
      { id: "blog", label: "Blog", href: "/blog" },
    ],
    showPhone: true,
    ctaLabel: "Get a Free Quote",
    ctaHref: "/quote",
    sticky: true,
    topBar: true,
    announcement: { enabled: false, text: "", linkLabel: "", href: "" },
    footerColumns: [
      {
        id: "plans",
        title: "Protected plans",
        links: [
          { id: "f-platinum", label: "Platinum Protection", href: "/plans/platinum" },
          { id: "f-gold", label: "Gold Protection", href: "/plans/gold" },
          { id: "f-powertrain", label: "Powertrain Protection", href: "/plans/powertrain" },
          { id: "f-maintenance", label: "Prepaid Maintenance", href: "/plans/prepaid-maintenance" },
          { id: "f-quote", label: "Get a free quote", href: "/quote" },
        ],
      },
      {
        id: "company",
        title: "Company",
        links: [
          { id: "f-why", label: "Why Alyson", href: "/why-alyson" },
          { id: "f-benefits", label: "Benefits", href: "/benefits" },
          { id: "f-claims", label: "Claims", href: "/claims" },
          { id: "f-repair", label: "Repair costs", href: "/repair-costs" },
          { id: "f-faq", label: "FAQ", href: "/faq" },
          { id: "f-blog", label: "Blog", href: "/blog" },
          { id: "f-about", label: "About us", href: "/about" },
          { id: "f-contact", label: "Contact", href: "/contact" },
        ],
      },
      {
        id: "policies",
        title: "Legal",
        links: [
          { id: "f-privacy", label: "Privacy Policy", href: "/privacy" },
          { id: "f-terms", label: "Terms and Conditions", href: "/terms" },
          { id: "f-dns", label: "Do Not Sell or Share My Personal Information", href: "/do-not-sell" },
        ],
      },
    ],
  } as NavigationSettings,
  legal: {
    privacyHtml: DEFAULT_PRIVACY_HTML,
    termsHtml: DEFAULT_TERMS_HTML,
    privacyUpdated: "2026-10-23",
    termsUpdated: "2026-10-23",
    privacyEmail: "",
    privacyPhone: "",
    mailingAddress: "",
    governingState: "Texas",
    honorGpc: true,
    responseDays: 45,
    confirmByEmail: true,
    reviewed: false,
  } as LegalSettings,
  blog: {
    title: "Latest News & Insights",
    intro: "Industry trends, practical guides and plain-English answers about extended auto warranties, vehicle service contracts and keeping repair costs down.",
    postsPerPage: 9,
    writersCanPublish: false,
    showQuoteCta: true,
    ctaTitle: "Worried about your next repair bill?",
    ctaText: "Get a free extended auto warranty quote for your car. Our team will contact you with plan options and prices. Free, no obligation.",
  } as BlogSettings,
  content: {
    hero: {
      eyebrow: "Extended auto warranty plans",
      title: "Caring for Your Vehicle, Every Step of the Way",
      subtitle: "You've come to the right place. {company} helps protect your budget from costly repairs with vehicle service contracts backed by real people, 24/7.",
      bullets: ["30-day money-back guarantee", "24/7 roadside assistance available", "Flexible payment options to suit your budget"],
    },
    stats: [
      { value: "24/7", label: "Claims line, even on holidays" },
      { value: "30-day", label: "Money-back guarantee" },
      { value: "3", label: "Coverage tiers to choose from" },
      { value: "200k", label: "Miles eligible with Powertrain" },
    ],
    about: {
      eyebrow: "About us",
      title: "{company} is here for you",
      body: "At {company}, we prioritize our clients and customers in every aspect of our work. We understand that building strong customer relationships is essential for success, and we make it our top focus. Our mission is to handle your claims swiftly and fairly, while delivering exceptional customer service that sets the benchmark in the industry.",
      points: ["Claims handled swiftly and fairly", "Repairs at any ASE-certified facility", "Three coverage tiers to fit your budget", "Preferred pricing for AAA, AARP, USAA and more"],
    },
    services: [
      { title: "Flexible Warranty", body: "Get comprehensive coverage with our flexible warranty options, designed to fit your needs and keep your vehicle protected." },
      { title: "No Hidden Fees", body: "At {company}, we pride ourselves on transparency. Enjoy service without surprise costs or hidden charges." },
      { title: "Client Satisfaction", body: "We ensure complete client satisfaction by delivering high-quality service and a seamless experience with every claim." },
    ],
    process: [
      { title: "Get in touch", body: "Request a free quote online or call us. Tell us about your car and how much protection you want." },
      { title: "Choose your plan", body: "We walk you through Platinum, Gold and Powertrain options and help you pick the one that fits your car and budget." },
      { title: "Drive with confidence", body: "When a covered part fails, take your car to any ASE-certified shop and let us handle the claim." },
    ],
    whyIntro:
      "Our goal is simple: take the stress out of car repairs. Repair bills can be expensive and often arrive at the worst possible time. A {company} vehicle service contract helps protect your budget, and real people are always a phone call away.",
    reasons: [
      { title: "Immediate 24/7 Response", body: "{company} is always just a phone call away, day or night, even during holidays. We never close. Whenever you need your car repaired, call our toll-free number and you will speak to a live operator." },
      { title: "Free Roadside Assistance", body: "Worried your car might break down at night, on the highway or on a country road? As a {company} customer, call a local tow company, have them start or tow your vehicle, and we reimburse the expense up to the amount set by your plan." },
      { title: "Any ASE-Certified Facility", body: "Have a trusted local repair center? As long as it's ASE (Automotive Service Excellence) certified, keep using it. Every reputable service center in the U.S. is ASE-certified, so your vehicle can be repaired almost anywhere." },
      { title: "30-Day Money-Back Guarantee", body: "Buy with confidence. Our 30-day money-back guarantee gives you a full month to change your mind and get 100% of what you paid back. We stand by our product." },
      { title: "Most Affordable Plans in the Industry", body: "With three tiers of coverage you choose the level that fits your lifestyle and budget. Why pay for extras you don't need? Instead of one-size-fits-all, we let you customize the plan to your needs." },
      { title: "Preferred Pricing for Members", body: "We've built relationships with respected organizations. Send proof of active membership in AAA, AARP, PenFed Credit Union, USAA, TriCare or the VA system and you qualify for additional discounts." },
    ],
    benefitsIntro:
      "As a car owner, you know your vehicle can run into unexpected trouble, from tire problems to engine failures, at any time. {company} offers more than the standard warranty: a choice of flexible plans so you have the protection and financial security to keep your car running long after the manufacturer's warranty expires.",
    claims: {
      intro: "To start your claim and get repairs underway, call us. Our claims department is open Monday through Friday, 8:00 AM to 7:00 PM (CT), and Saturdays 8:00 AM to noon (CT). For mechanical breakdowns, please follow the procedure outlined in your contract.",
      hours: "Mon–Fri 8:00 AM–7:00 PM CT · Sat 8:00 AM–12:00 PM CT",
      maintenanceIntro: "To file a maintenance claim, call us or email a copy of your invoice with proof of payment within 45 days of service.",
      maintenanceHours: "Mon–Fri 8:00 AM–5:00 PM CT",
      note: "Once approved, reimbursement is issued as a virtual {company} prepaid card. Please allow 2–3 weeks for processing and delivery. See our Terms and Conditions for a complete disclosure of fees.",
    },
    faqs: [
      { q: "What is a vehicle service contract?", a: "A vehicle service contract is an agreement with a third-party provider that covers repairs and maintenance after the manufacturer's warranty ends, protecting you from unexpected repair costs. It isn't insurance." },
      { q: "What is the difference between an extended warranty and a service contract?", a: "Extended warranties are typically offered by the manufacturer and provide coverage after the original warranty expires, while service contracts can be purchased from third-party providers like {company} and often cover a wider range of repairs and services." },
      { q: "How do I cancel my service contract?", a: "Most service contracts allow cancellation. You receive a full refund if you cancel within the first 30 days (our money-back guarantee) and a pro-rated refund for later cancellations. Always check the terms of your contract for specifics." },
      { q: "Do I need to use an approved repair shop?", a: "No. You can take your vehicle to any ASE-certified repair facility in the U.S. Check your contract's terms to make sure your repair is covered before work begins." },
      { q: "Can I transfer my service contract if I sell my vehicle?", a: "Many service contracts are transferable, which can increase the resale value of your vehicle. Contact us to understand the process and any associated fees." },
      { q: "How do repair claims get paid?", a: "Repair claims are usually paid directly to the repair shop after approval. In some cases you may need to pay up front and get reimbursed later." },
      { q: "What if my repair shop won't accept my plan?", a: "If your repair facility doesn't accept your plan, contact our customer support and we will help you find an alternative or authorized repair shop." },
      { q: "Why buy a service contract if my car is still under warranty?", a: "Service contracts provide additional coverage for things not included in your manufacturer's warranty, such as wear-and-tear repairs, roadside assistance and coverage for high-tech systems. Buying early usually also means a lower price." },
      { q: "How long do service contracts last?", a: "Service contracts vary in duration, typically offering coverage from one to several years. You choose a plan that fits your needs and how long you plan to keep the vehicle." },
      { q: "Can I extend my service contract later?", a: "Yes. Many plans offer the option to extend coverage, often at a discounted rate. Talk to us about extension options before your current contract expires." },
      { q: "How much does an extended auto warranty cost?", a: "Most plans cost about $600 to $1,500 a year, depending on the age, mileage and make of your car and the plan level, and many people pay monthly. Request a free quote and our team will give you prices for your car." },
      { q: "What if I have a claim dispute?", a: "Our dedicated support team helps resolve claim questions. The dispute resolution process is also outlined in your contract." },
    ],
    repairCosts: {
      "Engine Cylinder Head": "$7,500",
      Alternator: "$628-$814",
      "Instrument Cluster": "$885-$905",
      "A/C Compressor": "$550",
      "Backup Camera": "$631-$647",
      Transmission: "$3,000",
      "Power Steering Pump": "$500-$800",
      "Suspension Struts": "$1,254",
    },
    reviews: {
      theme: "plain",
      autoplaySeconds: 5,
      summary: null,
      items: [
        { name: "James Carter", location: "Houston, TX", date: "", rating: 5, text: "I had my alternator replaced, and I couldn't be happier! The process was easy, no hidden fees, and the team was very professional. The service was top-notch, and my car's electrical system has been running smoothly ever since." },
        { name: "David Thompson", location: "Dallas, TX", date: "", rating: 5, text: "I've never had such a smooth experience with a car service! The fuel pump repair was quick and efficient, and I didn't feel pressured into any extra services. The customer support team was incredibly friendly, and my car is running like new again!" },
        { name: "Laura Smith", location: "Austin, TX", date: "", rating: 5, text: "I'm really impressed with the brake caliper repair service. The team was transparent and thorough, ensuring everything was explained to me beforehand. My car drives so much better now! Excellent customer service and high-quality work." },
      ],
      award: null,
    },
  } as ContentSettings,
};

export type SettingKey = keyof typeof DEFAULTS;
export type Settings = { [K in SettingKey]: (typeof DEFAULTS)[K] };

// Only the raw rows are cached (saving any setting clears it); defaults are merged on every call,
// so a cache entry written before a new setting or field existed can't hide its default.
const loadRows = unstable_cache(
  async () => db.setting.findMany({ select: { key: true, value: true } }),
  ["settings-rows"],
  { tags: ["settings"] },
);

export async function getSettings(): Promise<Settings> {
  const out = structuredClone(DEFAULTS) as Settings;
  for (const row of await loadRows()) {
    if (!(row.key in DEFAULTS)) continue;
    try {
      const key = row.key as SettingKey;
      // Merge so settings saved before a new field was added still get its default.
      Object.assign(out[key], JSON.parse(row.value));
    } catch {}
  }
  out.business.social = { ...DEFAULTS.business.social, ...(out.business.social ?? {}) };
  out.content.hero = { ...DEFAULTS.content.hero, ...out.content.hero };
  out.content.about = { ...DEFAULTS.content.about, ...out.content.about };
  out.content.claims = { ...DEFAULTS.content.claims, ...out.content.claims };
  out.content.reviews = { ...DEFAULTS.content.reviews, ...out.content.reviews };
  out.navigation = normalizeNavigation(out.navigation);
  return out;
}

/** Fills in ids and missing fields for menus saved by older versions. */
function normalizeNavigation(nav: NavigationSettings): NavigationSettings {
  let n = 0;
  const item = (raw: Partial<MenuItem>, depth: number): MenuItem => ({
    id: raw.id || `m${++n}`,
    label: String(raw.label ?? ""),
    href: String(raw.href ?? "/"),
    ...(raw.newTab ? { newTab: true } : {}),
    ...(raw.description ? { description: String(raw.description) } : {}),
    ...(depth === 0 && raw.children?.length ? { children: raw.children.map((c) => item(c, 1)) } : {}),
  });
  return {
    ...nav,
    links: (nav.links ?? []).map((l) => item(l, 0)),
    sticky: nav.sticky ?? true,
    topBar: nav.topBar ?? true,
    announcement: { ...DEFAULTS.navigation.announcement, ...(nav.announcement ?? {}) },
    footerColumns: (nav.footerColumns ?? DEFAULTS.navigation.footerColumns).map((c, i) => ({
      id: c.id || `c${i}`,
      title: String(c.title ?? ""),
      links: (c.links ?? []).map((l) => item(l, 1)),
    })),
  };
}

export async function saveSetting<K extends SettingKey>(key: K, value: Settings[K]) {
  const json = JSON.stringify(value);
  await db.setting.upsert({ where: { key }, create: { key, value: json }, update: { value: json } });
  revalidateTag("settings");
}

/** Replaces {company} in editable text with the business name. */
export const fillCompany = (text: string) => text.replaceAll("{company}", site.name);

/** Business details for the public site: site.ts defaults overlaid with Admin → Settings. */
export async function getSite() {
  const { business } = await getSettings();
  const address = { street: business.street, city: business.city, state: business.state, zip: business.zip };
  return {
    ...site,
    ...business,
    address,
    addressLine: formatAddress(address),
    phoneHref: telHref(business.phone),
    sameAs: Object.values(business.social).filter((u) => /^https:\/\//.test(u)),
  };
}
export type SiteInfo = Awaited<ReturnType<typeof getSite>>;
