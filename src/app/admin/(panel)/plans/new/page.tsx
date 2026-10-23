import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { PlanForm } from "../PlanForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New plan" };

export default async function NewPlanPage() {
  await requireAdmin("admin");
  const last = await db.plan.aggregate({ _max: { sortOrder: true } });
  return (
    <PlanForm
      siteUrl={site.url}
      plan={{
        name: "",
        slug: "",
        tagline: "",
        summary: "",
        description: "",
        features: "",
        exclusions: "",
        bestFor: "",
        maxMileage: "",
        badge: "",
        icon: "shield",
        kind: "coverage",
        sortOrder: String((last._max.sortOrder ?? 0) + 1),
        active: false,
        featured: false,
        seoTitle: "",
        seoDescription: "",
      }}
    />
  );
}
