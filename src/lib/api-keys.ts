import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { canUseBlog, hasRole } from "./auth";
import { db } from "./db";
import { rateLimit } from "./rate-limit";
import type { Saver } from "./post-save";

// Keys for the API (/api/v1). A key is "aaw_" + 43 random characters. Only its SHA-256 hash is
// stored, so a database leak doesn't reveal working keys. Requests act as the admin user who
// created the key, limited by the key's scopes and the user's role:
//   blog     posts, categories, images            (writers, admins, owners)
//   content  site settings, menus, legal, plans   (admins, owners; publishing keys only to write)
//   leads    read leads and contact messages      (agents, admins, owners)

const PREFIX = "aaw_";
const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export const SCOPES = {
  blog: { label: "Blog", help: "Create and edit posts, upload images, manage categories." },
  content: { label: "Site content", help: "Read and (with publishing) change settings, menus, legal pages and plans." },
  leads: { label: "Leads & messages", help: "Read quote requests and contact messages (never writes them)." },
} as const;
export type Scope = keyof typeof SCOPES;

export const parseScopes = (csv: string) => csv.split(",").map((s) => s.trim()).filter((s): s is Scope => s in SCOPES);

/** Creates a key and returns it. This is the only time the full key exists outside the request. */
export async function createApiKey(userId: string, name: string, scopes: Scope[], canPublish: boolean) {
  const token = PREFIX + randomBytes(32).toString("base64url");
  const key = await db.apiKey.create({
    data: { userId, name, canPublish, scopes: scopes.join(","), prefix: token.slice(0, 10), tokenHash: hash(token) },
    select: { id: true },
  });
  return { id: key.id, token };
}

export type ApiCaller = { keyId: string; keyName: string; saver: Saver; canPublish: boolean; editor: boolean; role: string; scopes: Scope[] };

const fail = (status: number, error: string) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Checks "Authorization: Bearer aaw_…" and, when given, that the key has `scope`.
 * Returns the caller, or the error response to send. 120 requests per minute per key.
 */
export async function authenticateApiKey(req: Request, scope?: Scope): Promise<ApiCaller | NextResponse> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token.startsWith(PREFIX) || token.length < 40 || token.length > 100) return fail(401, "Missing or invalid API key");

  const key = await db.apiKey.findUnique({
    where: { tokenHash: hash(token) },
    select: { id: true, name: true, canPublish: true, scopes: true, revokedAt: true, lastUsedAt: true, user: { select: { id: true, email: true, role: true, active: true } } },
  });
  if (!key || key.revokedAt || !key.user.active) return fail(401, "Missing or invalid API key");

  const limit = rateLimit(`apikey:${key.id}`, 120, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  // Scopes the key has AND the user's role allows.
  const scopes = parseScopes(key.scopes).filter((s) => {
    if (s === "blog") return canUseBlog(key.user);
    if (s === "content") return hasRole(key.user, "admin");
    return hasRole(key.user, "agent");
  });
  if (scope && !scopes.includes(scope)) return fail(403, `This key can't use the ${SCOPES[scope].label.toLowerCase()} API`);

  // Record use at most every 5 minutes.
  if (!key.lastUsedAt || Date.now() - key.lastUsedAt.getTime() > 5 * 60_000) {
    await db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  }
  const editor = key.user.role === "admin" || key.user.role === "owner";
  return {
    keyId: key.id,
    keyName: key.name,
    canPublish: key.canPublish,
    editor,
    role: key.user.role,
    scopes,
    saver: { id: key.user.id, role: key.user.role, email: key.user.email, actor: `api:${key.name}`, publishAllowed: key.canPublish },
  };
}
