"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { MESSAGE_STATUS_LABELS } from "@/components/admin/statuses";

const back = (q: Record<string, string>) => redirect(`/admin/messages?${new URLSearchParams(q)}`);

export async function setMessageStatus(f: FormData) {
  const me = await requireAdmin();
  const id = String(f.get("id") ?? "");
  const status = String(f.get("status") ?? "");
  if (!(status in MESSAGE_STATUS_LABELS)) back({ error: "Choose a status." });
  const m = await db.contactMessage.findUnique({ where: { id }, select: { id: true } });
  if (!m) back({ error: "That message no longer exists." });
  await db.contactMessage.update({ where: { id }, data: { status, handledById: me.id } });
  await audit(me.email, "message_status", "message", id, { status });
  back({ open: id, saved: `Marked ${MESSAGE_STATUS_LABELS[status].toLowerCase()}.` });
}

export async function saveMessageNote(f: FormData) {
  const me = await requireAdmin();
  const id = String(f.get("id") ?? "");
  const note = String(f.get("note") ?? "").replace(/\r\n/g, "\n").trim().slice(0, 2000);
  const m = await db.contactMessage.findUnique({ where: { id }, select: { id: true } });
  if (!m) back({ error: "That message no longer exists." });
  await db.contactMessage.update({ where: { id }, data: { staffNote: note, handledById: me.id } });
  back({ open: id, saved: "Note saved." });
}

export async function deleteMessage(f: FormData) {
  const me = await requireAdmin("admin");
  const id = String(f.get("id") ?? "");
  const m = await db.contactMessage.findUnique({ where: { id }, select: { id: true } });
  if (m) {
    await db.contactMessage.delete({ where: { id } });
    await audit(me.email, "message_deleted", "message", id);
  }
  back({ saved: "Message deleted." });
}
