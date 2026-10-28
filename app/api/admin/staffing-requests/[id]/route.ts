import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const record = await prisma.staffingRequest.findUnique({
    where: { id: Number(id) },
    include: { talentRequests: { include: { talent: true } }, activities: { orderBy: { createdAt: "desc" } } },
  });
  if (!record) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(record);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    status?: "New" | "Analyzing" | "MatchingTalents" | "ShortlistSent" | "Interviewing" | "Contracting" | "Onboarded" | "Closed";
    owner?: string;
    internalNotes?: string;
    assignedTo?: string;
    notes?: string;
  } | null;
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const updated = await prisma.staffingRequest.update({
    where: { id: Number(id) },
    data: {
      ...(body.status        !== undefined && { status: body.status }),
      ...(body.owner         !== undefined && { owner: body.owner }),
      ...(body.internalNotes !== undefined && { internalNotes: body.internalNotes }),
      // assignedTo maps to owner field in model; notes maps to internalNotes
      ...(body.assignedTo    !== undefined && { owner: body.assignedTo }),
      ...(body.notes         !== undefined && { internalNotes: body.notes }),
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await prisma.staffingRequest.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
