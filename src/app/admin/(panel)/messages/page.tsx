import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-guard";
import { hasRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { MESSAGE_STATUS_LABELS, MESSAGE_STATUS_STYLES } from "@/components/admin/statuses";
import { Notice } from "@/components/admin/forms";
import { Card, PageHeader, btnPrimary, btnSecondary, dateTime, timeAgo } from "@/components/admin/ui";
import { deleteMessage, saveMessageNote, setMessageStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };
const PAGE = 30;

type Search = { status?: string; q?: string; page?: string; open?: string; saved?: string; error?: string };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const status = sp.status && sp.status in MESSAGE_STATUS_LABELS ? sp.status : "";
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const where: Prisma.ContactMessageWhereInput = {
    ...(status ? { status } : { status: { not: "archived" } }),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { subject: { contains: q, mode: "insensitive" } }, { message: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const [rows, total, counts, open] = await Promise.all([
    db.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, include: { handledBy: { select: { name: true } } } }),
    db.contactMessage.count({ where }),
    db.contactMessage.groupBy({ by: ["status"], _count: true }),
    sp.open ? db.contactMessage.findUnique({ where: { id: sp.open }, include: { handledBy: { select: { name: true } } } }) : Promise.resolve(null),
  ]);
  // Opening a new message marks it read.
  if (open && open.status === "new") {
    await db.contactMessage.update({ where: { id: open.id }, data: { status: "read", handledById: me.id } });
    open.status = "read";
  }
  const n = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const href = (over: Partial<Search>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ status, q, open: sp.open, ...over })) if (v) p.set(k, v);
    return `/admin/messages${p.size ? `?${p}` : ""}`;
  };
  const tabs: [string, string, number][] = [["", "Inbox", n("new") + n("read") + n("replied")], ["new", "New", n("new")], ["read", "Read", n("read")], ["replied", "Replied", n("replied")], ["archived", "Archived", n("archived")]];

  return (
    <>
      <PageHeader title="Messages" subtitle="Everything sent through the contact form. Open a message to reply by email and keep a note of what happened." actions={<Link href="/contact" target="_blank" className={btnSecondary}>View the form ↗</Link>} />
      <Notice saved={sp.saved} error={sp.error} />

      <div className={`grid gap-6 ${open ? "xl:grid-cols-[1fr_420px]" : ""}`}>
        <div className="rounded-xl border border-[#E4E7EC] bg-white shadow-card">
          <div className="flex flex-col gap-3 border-b border-[#EEF0F3] p-4 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex flex-wrap gap-1 text-sm">
              {tabs.map(([v, l, c]) => (
                <Link key={v || "inbox"} href={href({ status: v, page: "", open: "" })} aria-current={status === v ? "page" : undefined} className={`rounded-lg px-3 py-1.5 font-semibold ${status === v ? "bg-asphalt text-white" : "text-road hover:bg-[#F2F4F7]"}`}>
                  {l} <span className="ml-0.5 tabular-nums opacity-70">{c}</span>
                </Link>
              ))}
            </nav>
            <form className="flex gap-2">
              {status && <input type="hidden" name="status" value={status} />}
              <input name="q" defaultValue={q} placeholder="Search messages" aria-label="Search messages" className="h-9 w-56 rounded-lg border border-[#D0D5DD] px-3 text-sm focus:border-sky focus:outline-none" />
              <button className="h-9 rounded-lg bg-asphalt px-3 text-sm font-semibold text-white hover:bg-coal">Search</button>
            </form>
          </div>
          {rows.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <p className="font-semibold">{q ? "Nothing matches" : "No messages here"}</p>
              <p className="mt-1 text-sm text-road">{q ? "Try another search." : "Messages from the contact form appear here."}</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#EEF0F3]">
              {rows.map((m) => (
                <li key={m.id}>
                  <Link href={href({ open: m.id })} className={`block px-4 py-3 hover:bg-[#F9FAFB] ${sp.open === m.id ? "bg-brand-soft/60" : ""}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-sm">
                        <span className={`font-semibold ${m.status === "new" ? "text-asphalt" : "text-road"}`}>{m.name}</span>
                        <span className="text-road"> · {m.email}</span>
                      </p>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${MESSAGE_STATUS_STYLES[m.status]}`}>{MESSAGE_STATUS_LABELS[m.status]}</span>
                        <span className="text-xs text-road" title={dateTime(m.createdAt)}>{timeAgo(m.createdAt)}</span>
                      </span>
                    </div>
                    <p className={`mt-0.5 truncate text-sm ${m.status === "new" ? "font-medium" : "text-road"}`}>{m.subject ? `${m.subject} — ` : ""}{m.message}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-[#EEF0F3] px-4 py-3 text-sm text-road">
              <span>{total} messages</span>
              <span className="flex items-center gap-2">
                {page > 1 && <Link href={href({ page: String(page - 1) })} className={btnSecondary}>← Newer</Link>}
                Page {page} of {pages}
                {page < pages && <Link href={href({ page: String(page + 1) })} className={btnSecondary}>Older →</Link>}
              </span>
            </div>
          )}
        </div>

        {open && (
          <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <Card title={open.subject || "Message"} action={<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${MESSAGE_STATUS_STYLES[open.status]}`}>{MESSAGE_STATUS_LABELS[open.status]}</span>}>
              <dl className="text-sm">
                <div className="flex justify-between gap-3 py-1"><dt className="text-road">From</dt><dd className="font-medium">{open.name}</dd></div>
                <div className="flex justify-between gap-3 py-1"><dt className="text-road">Email</dt><dd><a href={`mailto:${open.email}`} className="text-sky hover:underline">{open.email}</a></dd></div>
                {open.phone && <div className="flex justify-between gap-3 py-1"><dt className="text-road">Phone</dt><dd><a href={`tel:${open.phone}`} className="text-sky hover:underline">{open.phone}</a></dd></div>}
                <div className="flex justify-between gap-3 py-1"><dt className="text-road">Received</dt><dd>{dateTime(open.createdAt)}</dd></div>
                {open.pageUrl && <div className="flex justify-between gap-3 py-1"><dt className="text-road">Sent from</dt><dd className="truncate">{open.pageUrl.replace(/^https?:\/\/[^/]+/, "") || "/"}</dd></div>}
                {open.handledBy && <div className="flex justify-between gap-3 py-1"><dt className="text-road">Handled by</dt><dd>{open.handledBy.name}</dd></div>}
              </dl>
              <p className="mt-4 whitespace-pre-wrap rounded-lg bg-[#F9FAFB] p-3 text-sm leading-relaxed">{open.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject || "Your message to Alyson Auto Warranty"}`)}`} className={btnPrimary}>Reply by email</a>
                {open.phone && <a href={`tel:${open.phone}`} className={btnSecondary}>Call</a>}
              </div>
              <form action={setMessageStatus} className="mt-4 flex flex-wrap gap-2 border-t border-[#EEF0F3] pt-4">
                <input type="hidden" name="id" value={open.id} />
                {(["replied", "read", "archived"] as const).filter((s) => s !== open.status).map((s) => (
                  <button key={s} name="status" value={s} className="rounded-lg border border-[#D0D5DD] px-3 py-1.5 text-xs font-semibold hover:bg-[#F9FAFB]">Mark {MESSAGE_STATUS_LABELS[s].toLowerCase()}</button>
                ))}
              </form>
            </Card>
            <Card title="Internal note">
              <form action={saveMessageNote} className="space-y-2">
                <input type="hidden" name="id" value={open.id} />
                <textarea name="note" defaultValue={open.staffNote} maxLength={2000} rows={3} placeholder="What you told them, next step…" className="block w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-sky focus:outline-none" />
                <button className={btnSecondary}>Save note</button>
              </form>
            </Card>
            {hasRole(me, "admin") && (
              <form action={deleteMessage} className="text-right">
                <input type="hidden" name="id" value={open.id} />
                <button className="text-sm font-semibold text-red-600 hover:underline">Delete message</button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
