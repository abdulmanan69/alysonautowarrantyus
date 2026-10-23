import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { getAllPlans } from "@/lib/plans";
import { Notice } from "@/components/admin/forms";
import { PageHeader, btnPrimary, btnSecondary, dateTime } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plans" };

export default async function PlansAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin("admin");
  const [sp, plans] = await Promise.all([searchParams, getAllPlans()]);
  return (
    <>
      <PageHeader
        title="Protection plans"
        subtitle="The plans shown on the website, at /plans and in the quote form. Lower order numbers show first."
        actions={
          <>
            <Link href="/plans" target="_blank" className={btnSecondary}>View on site ↗</Link>
            <Link href="/admin/plans/new" className={btnPrimary}>+ New plan</Link>
          </>
        }
      />
      <Notice saved={sp.saved} error={sp.error} />
      <div className="rounded-xl border border-[#E4E7EC] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#F9FAFB] text-xs uppercase tracking-wide text-road">
              <tr>{["Order", "Plan", "Address", "Type", "Badge", "Status", "Last edited", ""].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F3]">
              {plans.map((p) => (
                <tr key={p.id} className={`hover:bg-[#FCFCFD] ${p.active ? "" : "text-road"}`}>
                  <td className="px-4 py-3 tabular-nums">{p.sortOrder}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/plans/${p.id}`} className="font-semibold text-asphalt hover:text-sky">{p.name}</Link>
                    {p.tagline && <span className="block text-xs text-road">{p.tagline}</span>}
                  </td>
                  <td className="px-4 py-3 text-road">/plans/{p.slug}</td>
                  <td className="px-4 py-3 capitalize">{p.kind}{p.featured ? <span className="ml-2 text-line">★</span> : null}</td>
                  <td className="px-4 py-3">{p.badge || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-[#F2F4F7] text-road"}`}>{p.active ? "Live" : "Hidden"}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-road">{dateTime(p.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">{p.active && <a href={`/plans/${p.slug}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-sky hover:underline">View ↗</a>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-xs text-road">Plans of type “coverage” appear in the comparison table and the quote form&apos;s plan question (matched by address: platinum, gold, powertrain). “Maintenance” plans are shown as add-ons.</p>
    </>
  );
}
