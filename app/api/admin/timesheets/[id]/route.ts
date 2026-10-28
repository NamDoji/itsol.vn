import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });
  // Whitelist + type-cast for safe update
  const data: Record<string, unknown> = {};
  if (body.workingDays   !== undefined) data.workingDays   = Number(body.workingDays);
  if (body.approvedDays  !== undefined) data.approvedDays  = Number(body.approvedDays);
  if (body.overtimeHours !== undefined) data.overtimeHours = Number(body.overtimeHours);
  if (body.grossSalary   !== undefined) data.grossSalary   = body.grossSalary   ? Number(body.grossSalary)   : null;
  if (body.billingRate   !== undefined) data.billingRate   = body.billingRate   ? Number(body.billingRate)   : null;
  if (body.billingCurrency !== undefined) data.billingCurrency = body.billingCurrency || null;
  if (body.status        !== undefined) data.status        = String(body.status);
  if (body.note          !== undefined) data.note          = body.note || null;
  if (body.approvedBy    !== undefined) data.approvedBy    = body.approvedBy || null;
  if (body.invoiceRef    !== undefined) data.invoiceRef    = body.invoiceRef || null;
  if (body.clientRating  !== undefined) data.clientRating  = body.clientRating ? Number(body.clientRating) : null;
  const updated = await prisma.timesheet.update({
    where: { id: Number(id) },
    data,
    include: { talent: { select: { id: true, code: true, role: true, seniority: true, fullName: true } } },
  });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.timesheet.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
