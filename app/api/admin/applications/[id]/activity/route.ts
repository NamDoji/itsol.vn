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

  const activities = await prisma.applicationActivity.findMany({
    where: { applicationId: Number(id) },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(activities);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null) as {
    actor: string;
    action: string;
    fromStage?: string;
    toStage?: string;
    note?: string;
    scheduledAt?: string;
  } | null;

  if (!body?.actor || !body?.action) {
    return Response.json({ error: "actor and action are required" }, { status: 400 });
  }

  const activity = await prisma.applicationActivity.create({
    data: {
      applicationId: Number(id),
      actor: body.actor,
      action: body.action,
      fromStage: body.fromStage,
      toStage: body.toStage,
      note: body.note,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    },
  });

  return Response.json(activity, { status: 201 });
}
