import { unstable_cache, revalidateTag } from "next/cache";
import type { Plan } from "@prisma/client";
import { db } from "./db";

// Protection plans shown on the website. They live in the database (edit them in Admin → Plans);
// the defaults below are written the first time the table is empty, so a fresh install has the
// Platinum, Gold, Powertrain and Prepaid Maintenance plans straight away.

export const PLAN_ICONS = ["shield", "star", "engine", "wrench"] as const;
export type PlanIcon = (typeof PLAN_ICONS)[number];

type PlanSeed = Omit<Plan, "id" | "createdAt" | "updatedAt" | "features" | "exclusions"> & { features: string[]; exclusions: string[] };

export const DEFAULT_PLANS: PlanSeed[] = [
  {
    slug: "platinum",
    name: "Platinum Protection",
    tagline: "Unparalleled coverage for your vehicle",
    summary:
      "Our most complete plan protects nearly every part, component and system of your vehicle, a level of protection equivalent to the original manufacturer's warranty.",
    description:
      "<p>Our <strong>Platinum Protection</strong> plan offers unparalleled coverage, protecting nearly every part, component and system of your vehicle, providing a level of protection equivalent to the original manufacturer's warranty. This all-inclusive plan ensures your vehicle's key components, such as the engine, transmission, electrical systems, suspension, seals, gaskets and even automatic windows, are fully covered.</p><p>Compared to other plans on the market, Platinum Protection delivers exceptional value. It provides comprehensive coverage, ensuring that virtually every part of your vehicle is safeguarded under one robust contract.</p><p>With Platinum Protection you can rest assured that your vehicle is covered from bumper to bumper. This extensive coverage means peace of mind, knowing your vehicle is protected against unforeseen breakdowns and expensive repairs.</p>",
    features: [
      "Engine, transmission and drive axle",
      "Electrical and electronic systems",
      "Air conditioning, heating and cooling",
      "Steering, suspension and brakes",
      "Seals and gaskets",
      "Fuel system and turbo/supercharger",
      "Power windows, locks and seats",
      "24/7 roadside assistance, towing and rental car",
    ],
    exclusions: ["Routine maintenance items (oil, filters, wiper blades)", "Tires, glass and cosmetic items", "Pre-existing conditions", "Damage from accidents, misuse or lack of maintenance"],
    bestFor: "Newer vehicles and drivers who want manufacturer-style, exclusionary coverage.",
    maxMileage: 125000,
    badge: "Most complete",
    icon: "shield",
    kind: "coverage",
    sortOrder: 1,
    active: true,
    featured: true,
    seoTitle: "Platinum Protection Extended Auto Warranty | Alyson Auto Warranty",
    seoDescription: "Platinum Protection covers nearly every part of your vehicle, from engine and transmission to electronics, seals and gaskets. Get a free quote.",
  },
  {
    slug: "gold",
    name: "Gold Protection",
    tagline: "Comprehensive vehicle coverage for every driver",
    summary:
      "Comprehensive coverage for nearly every major component of your vehicle, listed part by part, with optional hi-tech and commercial add-ons.",
    description:
      "<p>The <strong>Gold Program</strong> provides comprehensive coverage for nearly every major component of your vehicle. It explicitly covers critical systems such as air conditioning, drivetrain, steering, fuel systems and more. If a part isn't specifically listed, it falls outside of the coverage. To further enhance your protection, we offer optional hi-tech and commercial coverage add-ons.</p><p>With the Gold Program you enjoy clear and thorough protection across a wide range of components, ensuring you're well-equipped for unexpected repairs.</p><p>Choose the Gold Program for peace of mind and a straightforward, comprehensive vehicle protection solution.</p>",
    features: [
      "Engine, transmission and drivetrain",
      "Air conditioning and cooling system",
      "Steering and front/rear suspension",
      "Brake system (excluding pads and shoes)",
      "Electrical system and fuel delivery",
      "Optional hi-tech electronics add-on",
      "Optional commercial-use add-on",
      "24/7 roadside assistance and towing",
    ],
    exclusions: ["Parts not specifically listed in the contract", "Routine maintenance and wear items", "Pre-existing conditions", "Damage from accidents, misuse or lack of maintenance"],
    bestFor: "Most cars and light trucks: broad, clearly listed coverage at a mid-range price.",
    maxMileage: 150000,
    badge: "Most popular",
    icon: "star",
    kind: "coverage",
    sortOrder: 2,
    active: true,
    featured: true,
    seoTitle: "Gold Protection Extended Auto Warranty | Alyson Auto Warranty",
    seoDescription: "Gold Protection covers nearly every major component: air conditioning, drivetrain, steering, fuel system and more, with optional hi-tech add-ons.",
  },
  {
    slug: "powertrain",
    name: "Powertrain Protection",
    tagline: "Essential coverage for your older vehicle",
    summary:
      "Designed for older, higher-mileage vehicles: protects the engine, transmission and other vital components that keep your car running, up to 200,000 miles.",
    description:
      "<p>Our <strong>Powertrain Program</strong> is designed specifically for older vehicles, offering essential coverage for the key components that keep your vehicle running smoothly. This program focuses on protecting critical parts like the engine, transmission and other vital systems necessary for your vehicle's performance.</p><p>Available for most vehicles up to 200,000 miles, the Powertrain Program ensures that your older vehicle remains protected. With this plan you can drive with confidence, knowing that the most important and most expensive components of your vehicle are safeguarded.</p><p>This targeted coverage helps you manage potentially costly repairs and maintain vehicle reliability over time.</p>",
    features: [
      "Engine (internally lubricated parts)",
      "Transmission and transfer case",
      "Drive axle assemblies",
      "Seals and gaskets for covered parts",
      "Available for most vehicles up to 200,000 miles",
      "24/7 roadside assistance and towing",
    ],
    exclusions: ["Electrical, A/C, steering and brake systems", "Routine maintenance and wear items", "Pre-existing conditions", "Damage from accidents, misuse or lack of maintenance"],
    bestFor: "Older and high-mileage vehicles where the engine and transmission are the big-ticket risks.",
    maxMileage: 200000,
    badge: "Best value",
    icon: "engine",
    kind: "coverage",
    sortOrder: 3,
    active: true,
    featured: true,
    seoTitle: "Powertrain Protection Plan for Older Vehicles | Alyson Auto Warranty",
    seoDescription: "Powertrain Protection covers the engine, transmission and drivetrain of vehicles up to 200,000 miles. Essential coverage at an affordable price.",
  },
  {
    slug: "prepaid-maintenance",
    name: "Prepaid Maintenance",
    tagline: "Save on essential services for your vehicle",
    summary:
      "Three oil changes, brake pad and shoe replacement, battery replacement and cooling system maintenance during the first year of your plan.",
    description:
      "<p>Looking to save money during the first year of your {company} plan? Our <strong>Prepaid Maintenance Plan</strong> offers essential services to keep your vehicle in top condition. This plan includes three oil changes, brake pad and shoe replacements, battery replacement and cooling system maintenance.</p><p>Regular maintenance is crucial for the longevity and performance of your vehicle, and the Prepaid Maintenance Plan ensures you're covered for key tasks like oil changes and brake pad replacements.</p><p>Please note that a surcharge applies to enroll in this cost-effective plan, but it gives you a smart way to manage your vehicle's upkeep. By investing in this plan you not only protect your vehicle's performance and longevity but also keep maintenance costs predictable.</p>",
    features: ["Three oil and filter changes", "Brake pad and shoe replacement", "Battery replacement", "Cooling system maintenance", "Reimbursed by virtual prepaid card after approval"],
    exclusions: ["Services outside the first contract year", "Repairs (covered by your protection plan instead)", "Invoices submitted more than 45 days after service"],
    bestFor: "Anyone who wants the first year of routine maintenance budgeted in advance.",
    maxMileage: null,
    badge: "Add-on",
    icon: "wrench",
    kind: "maintenance",
    sortOrder: 4,
    active: true,
    featured: false,
    seoTitle: "Prepaid Maintenance Plan | Alyson Auto Warranty",
    seoDescription: "Prepay a year of essential maintenance: three oil changes, brake pads and shoes, battery and cooling system service. Add it to any Alyson plan.",
  },
];

const parseList = (json: string): string[] => {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
};

export type PlanView = Omit<Plan, "features" | "exclusions"> & { features: string[]; exclusions: string[] };
export const planView = (p: Plan): PlanView => ({ ...p, features: parseList(p.features), exclusions: parseList(p.exclusions) });

async function seedIfEmpty() {
  if ((await db.plan.count()) > 0) return;
  await db.plan.createMany({
    data: DEFAULT_PLANS.map((p) => ({ ...p, features: JSON.stringify(p.features), exclusions: JSON.stringify(p.exclusions) })),
    skipDuplicates: true,
  });
}

const loadPlans = unstable_cache(
  async () => {
    await seedIfEmpty();
    return db.plan.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  },
  ["plans"],
  { tags: ["plans"] },
);

/** Every plan (admin), defaults seeded on first call. */
export async function getAllPlans(): Promise<PlanView[]> {
  return (await loadPlans()).map(planView);
}

/** Plans shown to visitors. */
export async function getPlans(): Promise<PlanView[]> {
  return (await getAllPlans()).filter((p) => p.active);
}

export async function getPlan(slug: string): Promise<PlanView | null> {
  return (await getPlans()).find((p) => p.slug === slug) ?? null;
}

export const revalidatePlans = () => revalidateTag("plans");
