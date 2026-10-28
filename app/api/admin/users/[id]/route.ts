import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/security";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.email) data.email = body.email;
  if (body.password) data.passwordHash = hashPassword(body.password);
  if (body.role && ["admin", "hr", "sales"].includes(body.role)) data.role = body.role;

  if (!Object.keys(data).length) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return Response.json(user);
  } catch {
    return Response.json({ error: "User not found or update failed" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
}
