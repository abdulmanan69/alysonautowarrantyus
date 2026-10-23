import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { channelStatus } from "@/lib/notify";
import { getSettings } from "@/lib/settings";
import { site } from "@/lib/site";
import { ERROR_ACTIONS, describe, entityLink } from "@/components/admin/activity";
import { Card, PageHeader, dateTime, timeAgo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

type Level = "ok" | "warn" | "fail" | "info";
type Check = { label: string; level: Level; detail: string; fix?: { href: string; text: string } };

const STYLE: Record<Level, { dot: string; badge: string; word: string }> = {
  ok: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700", word: "Good" },
  warn: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800", word: "Check" },
  fail: { dot: "bg-red-500", badge: "bg-red-50 text-red-700", word: "Problem" },
  info: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700", word: "Info" },
};

export default async function HealthPage() {
  await requireAdmin("admin");
  const day = new Date(Date.now() - 24 * 3600 * 1000);
  const twoDays = new Date(Date.now() - 48 * 3600 * 1000);
  const t0 = Date.now();
  const [leadCount, settings, admins, lastLead, errors24, recentErrors, staleNew, staleMessages, plans] = await Promise.all([
    db.lead.count(),
    getSettings(),
    db.adminUser.findMany({ where: { active: true }, select: { role: true, totpEnabled: true, name: true } }),
    db.lead.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    db.auditLog.groupBy({ by: ["action"], where: { createdAt: { gte: day }, action: { in: ERROR_ACTIONS } }, _count: true }),
    db.auditLog.findMany({ where: { action: { in: ERROR_ACTIONS } }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.lead.count({ where: { status: "new", createdAt: { lt: day } } }),
    db.contactMessage.count({ where: { status: "new", createdAt: { lt: twoDays } } }),
    db.plan.count({ where: { active: true, kind: "coverage" } }),
  ]);
  const dbMs = Date.now() - t0;
  const [overdueRequests, openRequests] = await Promise.all([
    db.privacyRequest.count({ where: { status: { in: ["new", "in_progress"] }, dueAt: { lt: new Date() } } }),
    db.privacyRequest.count({ where: { status: { in: ["new", "in_progress"] } } }),
  ]);
  const errs = (a: string) => errors24.find((e) => e.action === a)?._count ?? 0;
  const { business: b, tracking, verification, notifications: n, legal } = settings;
  const ch = channelStatus();
  const no2fa = admins.filter((u) => u.role !== "agent" && !u.totpEnabled);
  const placeholders = [/555-01\d\d/.test(b.phone) && "phone number", /example\.com$/i.test(b.email) && "email", /draft/i.test(b.consentVersion) && "consent text (draft)"].filter(Boolean) as string[];
  const alertsOn = !!(n.webhookUrl || (ch.email && n.emailTo) || (ch.sms && n.smsTo));

  const groups: { title: string; checks: Check[] }[] = [
    {
      title: "Core",
      checks: [
        { label: "Database", level: dbMs < 500 ? "ok" : "warn", detail: `Responding in ${dbMs} ms · ${leadCount.toLocaleString()} quote requests stored` },
        {
          label: "Live site address",
          level: site.url.startsWith("https://") ? "ok" : "warn",
          detail: site.url.startsWith("https://") ? site.url : `SITE_URL is ${site.url}. Set it to your https:// address so links in alerts, the sitemap and share previews are correct.`,
        },
        { label: "Share-image signing key", level: process.env.OG_SECRET ? "ok" : "warn", detail: process.env.OG_SECRET ? "OG_SECRET is set." : "Set OG_SECRET, or share-image links change on every restart." },
        { label: "Last quote request", level: "info", detail: lastLead ? `${timeAgo(lastLead.createdAt)} (${dateTime(lastLead.createdAt)})` : "No quote requests yet." },
      ],
    },
    {
      title: "Security",
      checks: [
        {
          label: "Two-factor sign-in",
          level: no2fa.length ? "warn" : "ok",
          detail: no2fa.length ? `Not on for: ${no2fa.map((u) => u.name).join(", ")}. Admins and owners should all use it.` : "On for every admin and owner.",
          fix: no2fa.length ? { href: "/admin/users", text: "Users" } : undefined,
        },
        {
          label: "Failed sign-ins (24h)",
          level: errs("sign_in_failed") + errs("2fa_failed") > 20 ? "warn" : "ok",
          detail: `${errs("sign_in_failed")} wrong passwords, ${errs("2fa_failed")} wrong codes. Sign-in pauses for 15 minutes after 10 failures.`,
          fix: { href: "/admin/activity?errors=1", text: "Activity" },
        },
      ],
    },
    {
      title: "Sales follow-up",
      checks: [
        {
          label: "Waiting quote requests",
          level: staleNew > 0 ? "warn" : "ok",
          detail: staleNew > 0 ? `${staleNew} request${staleNew === 1 ? "" : "s"} still “New” after 24 hours. Call them today.` : "Every request older than a day has been contacted.",
          fix: { href: "/admin/leads?status=new", text: "New requests" },
        },
        {
          label: "Unanswered messages",
          level: staleMessages > 0 ? "warn" : "ok",
          detail: staleMessages > 0 ? `${staleMessages} contact message${staleMessages === 1 ? "" : "s"} unread for more than 48 hours.` : "No contact messages waiting more than 48 hours.",
          fix: { href: "/admin/messages?status=new", text: "Messages" },
        },
        {
          label: "New-request alerts",
          level: !alertsOn || errs("notification_failed") ? "warn" : "ok",
          detail: alertsOn ? `On · ${errs("notification_failed")} failed alerts in 24h` : "No alerts set up, so nobody is told when a request or message arrives.",
          fix: { href: "/admin/settings", text: "Settings" },
        },
        {
          label: "TrustedForm consent certificates",
          level: "info",
          detail: process.env.NEXT_PUBLIC_TRUSTEDFORM_ENABLED === "true" ? "Enabled." : "Not enabled. Optional: add the ActiveProspect snippet in src/components/TrustedForm.tsx if your compliance team wants certificates.",
        },
      ],
    },
    {
      title: "Website",
      checks: [
        {
          label: "Protection plans",
          level: plans >= 1 ? "ok" : "fail",
          detail: plans >= 1 ? `${plans} coverage plan${plans === 1 ? "" : "s"} live.` : "No live coverage plans: the plans page and quote form have nothing to show.",
          fix: { href: "/admin/plans", text: "Plans" },
        },
        {
          label: "Business details",
          level: placeholders.length ? "warn" : "ok",
          detail: placeholders.length ? `Still using placeholder ${placeholders.join(", ")}.` : "Phone, email, address and consent are filled in.",
          fix: { href: "/admin/settings", text: "Settings" },
        },
        {
          label: "Privacy Policy and Terms",
          level: legal.reviewed ? "ok" : "warn",
          detail: legal.reviewed ? "Reviewed by your attorney." : "Using the built-in template. Have an attorney review it, then tick “Reviewed by our attorney”.",
          fix: { href: "/admin/legal", text: "Legal" },
        },
        {
          label: "Privacy requests",
          level: overdueRequests ? "fail" : openRequests ? "warn" : "ok",
          detail: overdueRequests
            ? `${overdueRequests} request${overdueRequests === 1 ? " is" : "s are"} past the legal deadline. Answer ${overdueRequests === 1 ? "it" : "them"} today.`
            : openRequests
              ? `${openRequests} open request${openRequests === 1 ? "" : "s"}, all within the deadline.`
              : `None open. Opt-outs are applied automatically${legal.honorGpc ? ", and Global Privacy Control is honored" : ""}.`,
          fix: { href: "/admin/privacy#requests", text: "Privacy" },
        },
        {
          label: "Analytics",
          level: tracking.ga4Id || tracking.gtmId ? "ok" : "info",
          detail: [tracking.ga4Id && "Google Analytics", tracking.gtmId && "Tag Manager", tracking.metaPixelId && "Meta Pixel"].filter(Boolean).join(", ") || "No analytics connected.",
          fix: { href: "/admin/settings", text: "Settings" },
        },
        {
          label: "Search engines",
          level: verification.google && verification.bing ? "ok" : verification.google ? "info" : "warn",
          detail:
            ([verification.google && "Google", verification.bing && "Bing", verification.yandex && "Yandex", verification.meta && "Meta"].filter(Boolean).join(", ") || "Not connected to Google Search Console yet") +
            (settings.indexnow.enabled ? " · IndexNow on" : " · IndexNow off"),
          fix: { href: "/admin/settings", text: "Settings" },
        },
      ],
    },
  ];
  const all = groups.flatMap((g) => g.checks);
  const problems = all.filter((c) => c.level === "fail").length;
  const warnings = all.filter((c) => c.level === "warn").length;
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

  return (
    <>
      <PageHeader title="System health" subtitle={problems ? `${plural(problems, "problem")} and ${plural(warnings, "thing")} to check` : warnings ? `${plural(warnings, "thing")} to check` : "Everything looks good"} />
      <div className="grid gap-6 xl:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.title} title={g.title}>
            <ul className="-my-2 divide-y divide-[#EEF0F3]">
              {g.checks.map((c) => (
                <li key={c.label} className="flex items-start gap-3 py-3 text-sm">
                  <span aria-hidden className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${STYLE[c.level].dot}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{c.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STYLE[c.level].badge}`}>{STYLE[c.level].word}</span>
                    </span>
                    <span className="mt-0.5 block text-road">{c.detail}</span>
                  </span>
                  {c.fix && <Link href={c.fix.href} className="shrink-0 text-sm font-semibold text-sky hover:underline">{c.fix.text} →</Link>}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Card title="Recent errors" action={<Link href="/admin/activity?errors=1" className="text-sm font-semibold text-sky hover:underline">All errors</Link>}>
          {recentErrors.length === 0 ? (
            <p className="text-sm text-road">No errors recorded.</p>
          ) : (
            <ul className="-my-2 divide-y divide-[#EEF0F3] text-sm">
              {recentErrors.map((r) => {
                const link = entityLink(r.entity, r.entityId);
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-red-700">
                      {describe(r.action, r.detail).text}
                      {link && <Link href={link} className="ml-2 text-xs font-semibold text-sky hover:underline">Open</Link>}
                    </span>
                    <span className="shrink-0 text-xs text-road" title={dateTime(r.createdAt)}>{timeAgo(r.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
      <p className="mt-3 text-xs text-road">Sign-in lockouts and rate limits are kept in this server&apos;s memory. If you run several app containers, move them to Redis or your host&apos;s firewall.</p>
    </>
  );
}
