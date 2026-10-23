import Link from "next/link";
import { Icon, IconBadge, type IconName } from "@/components/Icons";
import type { PlanView } from "@/lib/plans";

const ICON: Record<string, IconName> = { shield: "shield", star: "star", engine: "engine", wrench: "wrench" };
export const planIcon = (icon: string): IconName => ICON[icon] ?? "shield";

/** Plan summary card for the home page and /plans. */
export function PlanCard({ plan, compact = false }: { plan: PlanView; compact?: boolean }) {
  const featured = plan.featured && plan.badge === "Most popular";
  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border bg-white p-7 transition hover:-translate-y-1 hover:shadow-lift ${
        featured ? "border-brand shadow-[0_0_0_4px_rgba(255,187,0,0.18)]" : "border-rail"
      }`}
    >
      {plan.badge && (
        <span className={`absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${featured ? "bg-brand text-asphalt" : "bg-asphalt text-white"}`}>
          {plan.badge}
        </span>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-asphalt">
            <Link href={`/plans/${plan.slug}`} className="after:absolute after:inset-0">{plan.name}</Link>
          </h3>
          {plan.tagline && <p className="mt-1 text-sm font-medium text-brand-deep">{plan.tagline}</p>}
        </div>
        <IconBadge name={planIcon(plan.icon)} tone={featured ? "brand" : "soft"} />
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-road">{plan.summary}</p>
      {!compact && plan.features.length > 0 && (
        <ul className="mt-5 space-y-2 text-[15px]">
          {plan.features.slice(0, 5).map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-asphalt">
                <Icon name="check" size={12} strokeWidth={3} />
              </span>
              <span className="text-asphalt">{f}</span>
            </li>
          ))}
          {plan.features.length > 5 && <li className="pl-8 text-sm text-road">+ {plan.features.length - 5} more</li>}
        </ul>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        {plan.maxMileage ? <span className="text-xs font-semibold uppercase tracking-wide text-road">Up to {plan.maxMileage.toLocaleString("en-US")} mi</span> : <span />}
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-asphalt group-hover:text-brand-deep">
          See details <Icon name="arrow" size={16} />
        </span>
      </div>
    </article>
  );
}
