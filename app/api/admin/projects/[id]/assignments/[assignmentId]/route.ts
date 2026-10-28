import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; assignmentId: string }> };

// ── PATCH /api/admin/projects/:id/assignments/:assignmentId ──────────────────
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id, assignmentId } = await params;
  const projectId = Number(id);
  const asgId = Number(assignmentId);

  if (!asgId || isNaN(asgId)) {
    return Response.json({ error: "Invalid assignmentId" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  // Verify the assignment belongs to this project
  const existing = await prisma.projectAssignment.findFirst({
    where: { id: asgId, projectId },
  });
  if (!existing) {
    return Response.json({ error: "Assignment not found" }, { status: 404 });
  }

  // Build update payload — only accept the allowed fields
  const updateData: {
    role?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: string;
    grossSalary?: number | null;
    netSalary?: number | null;
    billingRate?: number | null;
    billingCurrency?: string;
  } = {};

  if ("role" in body) updateData.role = body.role ?? null;
  if ("startDate" in body) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
  if ("endDate" in body) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
  if ("status" in body) updateData.status = String(body.status);
  if ("grossSalary" in body) updateData.grossSalary = body.grossSalary != null ? Number(body.grossSalary) : null;
  if ("netSalary" in body) updateData.netSalary = body.netSalary != null ? Number(body.netSalary) : null;
  if ("billingRate" in body) updateData.billingRate = body.billingRate != null ? Number(body.billingRate) : null;
  if ("billingCurrency" in body) updateData.billingCurrency = String(body.billingCurrency);

  const updated = await prisma.projectAssignment.update({
    where: { id: asgId },
    data: updateData,
    include: {
      talent: {
        select: {
          id: true,
          code: true,
          role: true,
          seniority: true,
          status: true,
          grossSalary: true,
          netSalary: true,
        },
      },
    },
  });

  return Response.json(updated);
}

// ── DELETE /api/admin/projects/:id/assignments/:assignmentId ─────────────────
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id, assignmentId } = await params;
  const projectId = Number(id);
  const asgId = Number(assignmentId);

  if (!asgId || isNaN(asgId)) {
    return Response.json({ error: "Invalid assignmentId" }, { status: 400 });
  }

  const existing = await prisma.projectAssignment.findFirst({
    where: { id: asgId, projectId },
  });
  if (!existing) {
    return Response.json({ error: "Assignment not found" }, { status: 404 });
  }

  await prisma.projectAssignment.delete({ where: { id: asgId } });
  return Response.json({ ok: true });
}
