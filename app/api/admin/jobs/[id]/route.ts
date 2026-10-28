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
  const job = await prisma.job.findUnique({ where: { id: Number(id) } });
  if (!job) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(job);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const {
    title, department, location, level, description, published,
    headcount, expiresAt, requirements, benefits,
  } = body as {
    title?: string; department?: string; location?: string;
    level?: string; description?: string; published?: boolean;
    headcount?: unknown; expiresAt?: unknown; requirements?: unknown; benefits?: unknown;
  };

  const updated = await prisma.job.update({
    where: { id: Number(id) },
    data: {
      ...(title       !== undefined && { title }),
      ...(department  !== undefined && { department }),
      ...(location    !== undefined && { location }),
      ...(level       !== undefined && { level }),
      ...(description !== undefined && { description }),
      ...(published   !== undefined && { published }),
      ...(headcount   !== undefined && { headcount: Number(headcount) }),
      ...(expiresAt   !== undefined && { expiresAt: expiresAt ? new Date(String(expiresAt)) : null }),
      ...(requirements !== undefined && { requirements: requirements ? String(requirements) : null }),
      ...(benefits    !== undefined && { benefits: benefits ? String(benefits) : null }),
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
  await prisma.job.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
