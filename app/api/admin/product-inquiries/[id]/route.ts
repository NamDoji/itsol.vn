import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => ({})) as { status?: string };

  const allowed = ["new", "contacted", "qualified", "closed"];
  if (!body.status || !allowed.includes(body.status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  return Response.json(
    await prisma.productInquiry.update({
      where: { id: Number(id) },
      data: { status: body.status as "new" | "contacted" | "qualified" | "closed" },
    })
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await prisma.productInquiry.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
