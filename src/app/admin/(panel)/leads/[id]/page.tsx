import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { STATUS_HELP, STATUS_LABELS } from "@/components/admin/statuses";
import { describe } from "@/components/admin/activity";
import { Card, Field, StatusBadge, btnPrimary, btnSecondary, dateTime, timeAgo } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-guard";
import { hasRole } from "@/lib/auth";
import { planInterestLabel } from "@/lib/products";
import { stateName } from "@/lib/states";
import { addNote, addTask, assignLead, deleteLead, toggleDoNotContact, toggleTask, updateStatus } from "./actions";
import { SaveButton } from "./SaveButton";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = { own: "Owned", finance: "Financed", lease: "Leased", yes: "Still active", no: "Ended", not_sure: "Not sure" };
const label = (v?: string | null) => (v ? LABELS[v] ?? v : null);
const SOURCES: Record<string, string> = { quote: "Quote form (4 steps)", hero: "Homepage form (short)", api: "API" };

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const [lead, users] = await Promise.all([
    db.lead.findUnique({
      where: { id },
      include: {
        vehicles: true,
        consent: true,
        notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
        tasks: { orderBy: [{ doneAt: "asc" }, { dueAt: "asc" }], include: { assignee: { select: { name: true } } } },
      },
    }),
    db.adminUser.findMany({ where: { active: true, role: { not: "writer" } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!lead) notFound();
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const defaultDue = `${tomorrow.toISOString().slice(0, 10)}T10:00`;
  const logs = await db.auditLog.findMany({ where: { entity: "lead", entityId: id }, orderBy: { createdAt: "desc" } });
  const v = lead.vehicles[0];

  return (
    <>
      <Link href="/admin/leads" className="inline-flex items-center gap-1.5 text-sm font-medium text-road hover:text-asphalt">
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
        All quote requests
      </Link>

      <div className="mt-4 flex flex-col gap-5 rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand-deep">
            {lead.firstName[0]}
            {lead.lastName[0]}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{lead.firstName} {lead.lastName}</h1>
              <StatusBadge status={lead.status} />
              {lead.doNotContact && <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">Do not contact</span>}
              {lead.doNotSell && <span title="Opted out of sale/sharing" className="rounded-full bg-sky px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">Do not sell</span>}
            </div>
            <p className="mt-1 text-sm text-road">
              {stateName(lead.state)} {lead.zip} · {planInterestLabel(lead.planInterest)} · Received {timeAgo(lead.createdAt)} ({dateTime(lead.createdAt)})
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {lead.consent && !lead.doNotContact ? (
            <a href={`tel:${lead.phone}`} className={btnPrimary}>
              <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
              Call {lead.phone}
            </a>
          ) : null}
          <a href={`mailto:${lead.email}`} className={btnSecondary}>Email</a>
          {!lead.doNotContact && <a href={`sms:${lead.phone}`} className={btnSecondary}>Text</a>}
        </div>
      </div>

      {lead.doNotContact && (
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <strong>Do not contact.</strong> This person asked not to be contacted, or matches your do-not-contact list. Don&apos;t call, text or email.
        </div>
      )}
      {!lead.consent && (
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <strong>No consent record for this request.</strong> Do not call or text until consent is confirmed.
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title={`Notes (${lead.notes.length})`}>
              <form action={addNote} className="space-y-2">
                <input type="hidden" name="id" value={lead.id} />
                <label htmlFor="note" className="sr-only">New note</label>
                <textarea id="note" name="body" required maxLength={2000} rows={3} placeholder="Call outcome, what they asked, next step…" className="block w-full rounded-lg border border-[#D0D5DD] px-3 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky/15" />
                <button className={btnPrimary}>Add note</button>
              </form>
              {lead.notes.length > 0 && (
                <ul className="mt-5 space-y-4 border-t border-[#EEF0F3] pt-4">
                  {lead.notes.map((n) => (
                    <li key={n.id} className="text-sm">
                      <p className="whitespace-pre-wrap leading-relaxed">{n.body}</p>
                      <p className="mt-1 text-xs text-road" title={dateTime(n.createdAt)}>{n.author?.name ?? "Former user"} · {timeAgo(n.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title={`Follow-ups (${lead.tasks.filter((t) => !t.doneAt).length} open)`}>
              <form action={addTask} className="grid gap-2 sm:grid-cols-2">
                <input type="hidden" name="id" value={lead.id} />
                <label className="sr-only" htmlFor="task-title">Task</label>
                <input id="task-title" name="title" required maxLength={140} placeholder="e.g. Call back with plan prices" className="h-10 rounded-lg border border-[#D0D5DD] px-3 text-sm focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky/15 sm:col-span-2" />
                <label className="sr-only" htmlFor="task-due">Due</label>
                <input id="task-due" name="dueAt" type="datetime-local" required defaultValue={defaultDue} className="h-10 rounded-lg border border-[#D0D5DD] px-3 text-sm" />
                <label className="sr-only" htmlFor="task-who">Assign to</label>
                <select id="task-who" name="assigneeId" defaultValue={me.id} className="h-10 rounded-lg border border-[#D0D5DD] bg-white px-2 text-sm">
                  {users.map((u) => <option key={u.id} value={u.id}>{u.id === me.id ? `Me (${u.name})` : u.name}</option>)}
                </select>
                <button className={`${btnPrimary} sm:col-span-2`}>Add follow-up</button>
              </form>
              {lead.tasks.length > 0 && (
                <ul className="mt-5 space-y-2 border-t border-[#EEF0F3] pt-4">
                  {lead.tasks.map((t) => {
                    const overdue = !t.doneAt && t.dueAt < now;
                    return (
                      <li key={t.id} className="flex items-start gap-3 text-sm">
                        <form action={toggleTask}>
                          <input type="hidden" name="taskId" value={t.id} />
                          <button aria-label={t.doneAt ? `Reopen ${t.title}` : `Mark ${t.title} done`} className={`mt-0.5 grid h-5 w-5 place-items-center rounded border-2 ${t.doneAt ? "border-emerald-500 bg-emerald-500 text-white" : "border-[#D0D5DD] hover:border-sky"}`}>
                            {t.doneAt && <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>}
                          </button>
                        </form>
                        <span className={t.doneAt ? "text-road line-through" : ""}>
                          {t.title}
                          <span className={`block text-xs ${overdue ? "font-semibold text-red-600" : "text-road"}`}>
                            {overdue ? "Overdue · " : ""}Due {dateTime(t.dueAt)} · {t.assignee?.name ?? "Unassigned"}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Contact">
              <dl className="-my-2.5 divide-y divide-[#EEF0F3]">
                <Field label="Phone"><a className="text-sky hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a></Field>
                <Field label="Email"><a className="text-sky hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a></Field>
                <Field label="Location">{stateName(lead.state)} {lead.zip}</Field>
                <Field label="Plan interest">{planInterestLabel(lead.planInterest)}</Field>
                <Field label="Came from">{SOURCES[lead.source] ?? lead.source}</Field>
              </dl>
            </Card>

            <Card title="Vehicle">
              <dl className="-my-2.5 divide-y divide-[#EEF0F3]">
                {v ? (
                  <>
                    <Field label="Vehicle">{`${v.year} ${v.make} ${v.model}`}</Field>
                    <Field label="Mileage">{v.mileage ? (v.mileage >= 200000 ? "150,000 or more miles" : `Up to ${v.mileage.toLocaleString()} miles`) : null}</Field>
                    <Field label="Ownership">{label(v.ownership)}</Field>
                    <Field label="Factory warranty">{label(v.factoryWarranty)}</Field>
                  </>
                ) : (
                  <Field label="Vehicle">{null}</Field>
                )}
              </dl>
              {lead.source === "hero" && <p className="mt-3 text-xs text-road">The short homepage form doesn&apos;t ask for mileage, ownership or warranty status. Confirm them on the call.</p>}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Consent record">
              {lead.consent ? (
                <dl className="-my-2.5 divide-y divide-[#EEF0F3]">
                  <Field label="Agreed at">{dateTime(lead.consent.createdAt)}</Field>
                  <Field label="Version">{lead.consent.consentVersion}</Field>
                  <Field label="IP address">{lead.consent.ipAddress}</Field>
                  <Field label="Page">{lead.consent.pageUrl}</Field>
                  <Field label="TrustedForm">{lead.trustedFormCertUrl ? <a href={lead.trustedFormCertUrl} target="_blank" rel="noreferrer" className="text-sky hover:underline">View certificate</a> : null}</Field>
                  <Field label="Text shown"><span className="font-normal text-road">{lead.consent.consentText}</span></Field>
                </dl>
              ) : (
                <p className="text-sm font-medium text-red-700">No consent record. Do not contact.</p>
              )}
            </Card>

            <Card title="Attribution">
              <dl className="-my-2.5 divide-y divide-[#EEF0F3]">
                <Field label="Source / medium">{[lead.utmSource, lead.utmMedium].filter(Boolean).join(" / ") || "Direct"}</Field>
                <Field label="Campaign">{lead.utmCampaign}</Field>
                <Field label="Keyword">{lead.utmTerm}</Field>
                <Field label="Google click ID">{lead.gclid}</Field>
                <Field label="Meta click ID">{lead.fbclid}</Field>
                <Field label="Landing page">{lead.landingPage}</Field>
                <Field label="Referrer">{lead.referrer}</Field>
              </dl>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Status">
            <form action={updateStatus} className="space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="status" className="sr-only">Status</label>
              <select id="status" name="status" defaultValue={lead.status} className="input h-11">
                {Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <label htmlFor="lostReason" className="block text-xs font-medium text-road">Reason (for lost or unqualified)</label>
              <input id="lostReason" name="lostReason" defaultValue={lead.lostReason} maxLength={200} placeholder="e.g. Price, bought elsewhere, car too old" className="h-10 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm" />
              <SaveButton />
            </form>
            <ul className="mt-4 space-y-1 border-t border-[#EEF0F3] pt-3 text-xs text-road">
              {Object.entries(STATUS_HELP).map(([k, h]) => <li key={k}><strong className="text-asphalt">{STATUS_LABELS[k]}:</strong> {h}</li>)}
            </ul>
            <form action={assignLead} className="mt-5 space-y-2 border-t border-[#EEF0F3] pt-4">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="assignedToId" className="block text-sm font-medium">Assigned to</label>
              <div className="flex gap-2">
                <select id="assignedToId" name="assignedToId" defaultValue={lead.assignedToId ?? ""} className="h-10 flex-1 rounded-lg border border-[#D0D5DD] bg-white px-2 text-sm">
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <button className={btnSecondary}>Assign</button>
              </div>
              {lead.assignedToId !== me.id && <button name="assignedToId" value={me.id} className="text-sm font-semibold text-sky hover:underline">Assign to me</button>}
            </form>
            {(!lead.doNotContact || hasRole(me, "admin")) && (
              <form action={toggleDoNotContact} className="mt-4 border-t border-[#EEF0F3] pt-4">
                <input type="hidden" name="id" value={lead.id} />
                <button className={`text-sm font-semibold hover:underline ${lead.doNotContact ? "text-emerald-700" : "text-red-600"}`}>
                  {lead.doNotContact ? "Remove do-not-contact" : "Mark as do not contact"}
                </button>
              </form>
            )}
          </Card>

          <Card title="Activity">
            {logs.length === 0 ? (
              <p className="text-sm text-road">No activity recorded.</p>
            ) : (
              <ol className="relative space-y-5 border-l border-[#E4E7EC] pl-5">
                {logs.map((l) => {
                  const e = describe(l.action, l.detail);
                  return (
                    <li key={l.id} className="relative text-sm">
                      <span aria-hidden className={`absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white ring-1 ${e.error ? "bg-red-500 ring-red-300" : "bg-brand ring-brand/40"}`} />
                      <p className={`font-medium ${e.error ? "text-red-700" : ""}`}>{e.text}</p>
                      <p className="mt-0.5 text-xs text-road" title={dateTime(l.createdAt)}>{timeAgo(l.createdAt)} · by {l.actor}</p>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>

          {hasRole(me, "admin") && (
            <Card title="Danger zone">
              <form action={deleteLead}>
                <input type="hidden" name="id" value={lead.id} />
                <p className="text-sm text-road">Permanently deletes this request with its vehicle, consent record, notes and tasks. Use the Privacy page for deletion requests from the person themselves.</p>
                <label className="mt-3 block text-sm">
                  Type <strong>DELETE</strong> to confirm
                  <input name="confirm" autoComplete="off" className="mt-1.5 h-10 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm" />
                </label>
                <button className="mt-3 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete request</button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
