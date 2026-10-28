import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
    include: {
      assignments: {
        include: {
          talent: { select: { id: true, code: true, role: true, seniority: true, status: true, fullName: true } },
        },
      },
    },
  });
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });
  const data: Record<string, unknown> = {};
  const fields = ["name","clientName","clientEmail","clientPhone","contractNumber",
    "projectType","status","description","currency","rate"];
  for (const f of fields) if (body[f] !== undefined) data[f] = body[f] === "" ? null : body[f];
  if (body.contractValue !== undefined) data.contractValue = body.contractValue ? Number(body.contractValue) : null;
  if (body.overheadRate  !== undefined) data.overheadRate  = Number(body.overheadRate);
  if (body.isBackOffice  !== undefined) data.isBackOffice  = Boolean(body.isBackOffice);
  if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(String(body.startDate)) : null;
  if (body.endDate   !== undefined) data.endDate   = body.endDate   ? new Date(String(body.endDate))   : null;
  const updated = await prisma.project.update({ where: { id: Number(id) }, data });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.project.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
