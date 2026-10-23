import { requireAdmin } from "@/lib/admin-guard";
import { SCOPES, parseScopes } from "@/lib/api-keys";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { Notice } from "@/components/admin/forms";
import { Card, PageHeader, dateTime } from "@/components/admin/ui";
import { revokeKey } from "./actions";
import { NewKeyForm } from "./NewKeyForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "API keys" };

const ENDPOINTS: [string, string, string][] = [
  ["GET", "/api/v1/site", "Pages, plans, categories, tags and posts, plus what the key may do"],
  ["GET/POST", "/api/v1/posts", "List posts · create a post (blog)"],
  ["GET/PATCH", "/api/v1/posts/{id-or-slug}", "Read · update a post (blog)"],
  ["POST", "/api/v1/media", "Upload an image: multipart file + alt (blog)"],
  ["POST", "/api/v1/categories", "Create or update a category (blog, admin keys)"],
  ["GET", "/api/v1/plans", "Protection plans (content)"],
  ["GET/PUT/PATCH", "/api/v1/settings/{navigation|legal|content|business}", "Read or change site settings (content, publishing keys to write)"],
  ["GET", "/api/v1/leads", "Quote requests, newest first; ?status= ?since= ?page= (leads)"],
  ["GET", "/api/v1/leads/{id}", "One quote request with vehicle and notes (leads)"],
  ["GET", "/api/v1/messages", "Contact-form messages (leads)"],
];

export default async function ApiKeysPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const me = await requireAdmin("admin");
  const sp = await searchParams;
  const keys = await db.apiKey.findMany({
    where: me.role === "owner" ? {} : { userId: me.id },
    orderBy: [{ revokedAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }],
    select: { id: true, name: true, prefix: true, scopes: true, canPublish: true, createdAt: true, lastUsedAt: true, revokedAt: true, user: { select: { name: true } } },
  });

  return (
    <>
      <PageHeader
        title="API keys"
        subtitle={<>Keys for the API at <code className="text-asphalt">{site.url}/api/v1</code>. A key acts as you, is limited to the scopes you give it, and can be revoked at any time. Send it as <code className="text-asphalt">Authorization: Bearer aaw_…</code>.</>}
      />
      <Notice saved={sp.saved} error={sp.error} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="Your keys">
            {keys.length === 0 ? (
              <p className="text-sm text-road">No keys yet.</p>
            ) : (
              <div className="-mx-5 -my-5 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[#F9FAFB] text-xs uppercase tracking-wide text-road">
                    <tr>{["Name", "Key", "Scopes", "Publishing", "Last used", "Status", ""].map((h) => <th key={h} scope="col" className="px-5 py-2.5 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF0F3]">
                    {keys.map((k) => (
                      <tr key={k.id} className={k.revokedAt ? "text-road/60" : ""}>
                        <td className="px-5 py-3 font-semibold">{k.name}{me.role === "owner" && <span className="block text-xs font-normal text-road">{k.user.name}</span>}</td>
                        <td className="px-5 py-3 font-mono text-xs">{k.prefix}…</td>
                        <td className="px-5 py-3">{parseScopes(k.scopes).map((s) => SCOPES[s].label).join(", ") || "—"}</td>
                        <td className="px-5 py-3">{k.canPublish ? "Yes" : "Drafts only"}</td>
                        <td className="px-5 py-3">{k.lastUsedAt ? dateTime(k.lastUsedAt) : "Never"}</td>
                        <td className="px-5 py-3">{k.revokedAt ? `Revoked ${dateTime(k.revokedAt)}` : <span className="font-semibold text-emerald-700">Active</span>}</td>
                        <td className="px-5 py-3 text-right">
                          {!k.revokedAt && (
                            <form action={revokeKey}>
                              <input type="hidden" name="id" value={k.id} />
                              <button className="font-semibold text-red-600 hover:underline">Revoke</button>
                            </form>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          <Card title="Endpoints">
            <ul className="-my-2 divide-y divide-[#EEF0F3] text-sm">
              {ENDPOINTS.map(([m, path, what]) => (
                <li key={path} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:gap-4">
                  <code className="shrink-0 rounded bg-[#F2F4F7] px-1.5 py-0.5 text-xs font-semibold">{m}</code>
                  <code className="shrink-0 text-xs text-asphalt">{path}</code>
                  <span className="text-road">{what}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-road">Responses are JSON. 120 requests per minute per key. A command-line client is included: <code>node scripts/api-client.mjs --help</code> (reads <code>.env.api</code>).</p>
          </Card>
        </div>
        <Card title="Create a key">
          <NewKeyForm />
        </Card>
      </div>
    </>
  );
}
