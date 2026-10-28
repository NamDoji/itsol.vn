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

  const application = await prisma.jobApplication.findUnique({
    where: { id: Number(id) },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      job: true,
    },
  });

  if (!application) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(application);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const allowedFields = [
    "status",
    "candidateStatus",
    "internalNotes",
    "projectMatch",
    "assignedTo",
    "interviewDate",
    "offerDate",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) {
      if ((key === "interviewDate" || key === "offerDate") && body[key]) {
        data[key] = new Date(body[key] as string);
      } else {
        data[key] = body[key];
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.jobApplication.update({
    where: { id: Number(id) },
    data,
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
  await prisma.jobApplication.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
