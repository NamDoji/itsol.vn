import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/admin/projects/:id/assignments ──────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const assignments = await prisma.projectAssignment.findMany({
    where: { projectId: Number(id) },
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
    orderBy: { createdAt: "asc" },
  });

  return Response.json(assignments);
}

// ── POST /api/admin/projects/:id/assignments ─────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!body?.talentId) {
    return Response.json({ error: "talentId required" }, { status: 400 });
  }

  const assignment = await prisma.projectAssignment.create({
    data: {
      projectId: Number(id),
      talentId: Number(body.talentId),
      role: body.role ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status ?? "active",
      grossSalary: body.grossSalary != null ? Number(body.grossSalary) : null,
      netSalary: body.netSalary != null ? Number(body.netSalary) : null,
      billingRate: body.billingRate != null ? Number(body.billingRate) : null,
      billingCurrency: body.billingCurrency ?? "VND",
    },
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

  return Response.json(assignment, { status: 201 });
}

// ── DELETE /api/admin/projects/:id/assignments?assignmentId=N ────────────────
export async function DELETE(req: NextRequest, { params: _params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const assignmentId = Number(new URL(req.url).searchParams.get("assignmentId"));
  if (!assignmentId) {
    return Response.json({ error: "assignmentId required" }, { status: 400 });
  }

  await prisma.projectAssignment.delete({ where: { id: assignmentId } });
  return Response.json({ ok: true });
}
