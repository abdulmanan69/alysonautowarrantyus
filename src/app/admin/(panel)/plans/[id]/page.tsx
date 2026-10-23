import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { planView } from "@/lib/plans";
import { site } from "@/lib/site";
import { PlanForm } from "../PlanForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit plan" };

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("admin");
  const p = await db.plan.findUnique({ where: { id: (await params).id } });
  if (!p) notFound();
  const v = planView(p);
  return (
    <PlanForm
      key={p.id}
      siteUrl={site.url}
      plan={{
        id: v.id,
        name: v.name,
        slug: v.slug,
        tagline: v.tagline,
        summary: v.summary,
        description: v.description,
        features: v.features.join("\n"),
        exclusions: v.exclusions.join("\n"),
        bestFor: v.bestFor,
        maxMileage: v.maxMileage ? String(v.maxMileage) : "",
        badge: v.badge,
        icon: v.icon,
        kind: v.kind === "maintenance" ? "maintenance" : "coverage",
        sortOrder: String(v.sortOrder),
        active: v.active,
        featured: v.featured,
        seoTitle: v.seoTitle,
        seoDescription: v.seoDescription,
      }}
    />
  );
}
