"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { hasRole } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { STATUS_LABELS } from "@/components/admin/statuses";

const id = (f: FormData, k = "id") => String(f.get(k) ?? "");
const refresh = (leadId: string) => {
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
};

export async function updateStatus(f: FormData) {
  const me = await requireAdmin();
  const leadId = id(f);
  const status = String(f.get("status") ?? "");
  if (!leadId || !(status in STATUS_LABELS)) return;
  const lostReason = status === "lost" || status === "unqualified" ? String(f.get("lostReason") ?? "").trim().slice(0, 200) : "";
  await db.lead.update({ where: { id: leadId }, data: { status, lostReason } });
  await audit(me.email, "status_changed", "lead", leadId, { status, reason: lostReason || undefined });
  refresh(leadId);
}

export async function assignLead(f: FormData) {
  const me = await requireAdmin();
  const leadId = id(f);
  const to = id(f, "assignedToId") || null;
  if (to && !(await db.adminUser.findFirst({ where: { id: to, active: true }, select: { id: true } }))) return;
  const user = to ? await db.adminUser.findUnique({ where: { id: to }, select: { name: true } }) : null;
  await db.lead.update({ where: { id: leadId }, data: { assignedToId: to } });
  await audit(me.email, "lead_assigned", "lead", leadId, { to: user?.name ?? "Unassigned" });
  refresh(leadId);
}

export async function toggleDoNotContact(f: FormData) {
  const me = await requireAdmin();
  const lead = await db.lead.findUnique({ where: { id: id(f) }, select: { id: true, doNotContact: true, email: true, phone: true } });
  if (!lead) return;
  // Anyone can stop contact; only admins can lift it again.
  if (lead.doNotContact && !hasRole(me, "admin")) return;
  await db.lead.update({ where: { id: lead.id }, data: { doNotContact: !lead.doNotContact } });
  if (!lead.doNotContact) {
    const exists = await db.suppression.findFirst({ where: { OR: [{ email: lead.email }, { phone: lead.phone }] }, select: { id: true } });
    if (!exists) await db.suppression.create({ data: { email: lead.email, phone: lead.phone, reason: `Marked on request by ${me.name}` } });
  }
  await audit(me.email, lead.doNotContact ? "dnc_removed" : "dnc_added", "lead", lead.id);
  refresh(lead.id);
}

export async function addNote(f: FormData) {
  const me = await requireAdmin();
  const leadId = id(f);
  const body = String(f.get("body") ?? "").replace(/\r\n/g, "\n").trim().slice(0, 2000);
  if (!body || !(await db.lead.findUnique({ where: { id: leadId }, select: { id: true } }))) return;
  await db.leadNote.create({ data: { leadId, authorId: me.id, body } });
  await audit(me.email, "note_added", "lead", leadId);
  refresh(leadId);
}

export async function addTask(f: FormData) {
  const me = await requireAdmin();
  const leadId = id(f);
  const title = String(f.get("title") ?? "").trim().slice(0, 140);
  const dueAt = new Date(String(f.get("dueAt") ?? ""));
  if (!title || Number.isNaN(dueAt.getTime())) return;
  const assigneeId = id(f, "assigneeId") || me.id;
  if (!(await db.adminUser.findFirst({ where: { id: assigneeId, active: true }, select: { id: true } }))) return;
  await db.leadTask.create({ data: { leadId, title, dueAt, assigneeId } });
  await audit(me.email, "task_added", "lead", leadId, { title, due: dueAt.toISOString() });
  refresh(leadId);
}

export async function toggleTask(f: FormData) {
  const me = await requireAdmin();
  const task = await db.leadTask.findUnique({ where: { id: id(f, "taskId") } });
  if (!task) return;
  await db.leadTask.update({ where: { id: task.id }, data: { doneAt: task.doneAt ? null : new Date() } });
  await audit(me.email, task.doneAt ? "task_reopened" : "task_done", "lead", task.leadId, { title: task.title });
  refresh(task.leadId);
}

/** Admins only. Removes the request and everything attached to it. */
export async function deleteLead(f: FormData) {
  const me = await requireAdmin("admin");
  const leadId = id(f);
  if (String(f.get("confirm") ?? "").trim() !== "DELETE") return;
  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true, state: true } });
  if (!lead) return;
  await db.lead.delete({ where: { id: leadId } });
  await audit(me.email, "lead_deleted", "lead", leadId, { state: lead.state });
  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}
