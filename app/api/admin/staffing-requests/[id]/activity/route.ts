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

  const activities = await prisma.staffingActivity.findMany({
    where: { staffingRequestId: Number(id) },
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
    fromStatus?: string;
    toStatus?: string;
    note?: string;
  } | null;

  if (!body?.actor || !body?.action) {
    return Response.json({ error: "actor and action are required" }, { status: 400 });
  }

  const activity = await prisma.staffingActivity.create({
    data: {
      staffingRequestId: Number(id),
      actor: body.actor,
      action: body.action,
      fromStatus: body.fromStatus,
      toStatus: body.toStatus,
      note: body.note,
    },
  });

  return Response.json(activity, { status: 201 });
}
