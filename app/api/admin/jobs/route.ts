import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(jobs);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const { id, title, department, location, level, description, published,
          headcount, expiresAt, requirements, benefits } = body as {
    id?: number; title?: string; department?: string; location?: string;
    level?: string; description?: string; published?: boolean;
    headcount?: unknown; expiresAt?: unknown; requirements?: unknown; benefits?: unknown;
  };

  if (!title || !department || !location || !level) {
    return Response.json({ error: "title, department, location, level required" }, { status: 400 });
  }

  const sharedData = {
    title,
    department,
    location,
    level,
    description:  description ?? "",
    published:    published ?? true,
    headcount:    headcount   ? Number(headcount)              : 1,
    expiresAt:    expiresAt   ? new Date(String(expiresAt))    : null,
    requirements: requirements ? String(requirements)          : null,
    benefits:     benefits    ? String(benefits)               : null,
  };

  if (id) {
    const updated = await prisma.job.update({
      where: { id: Number(id) },
      data: sharedData,
    });
    return Response.json(updated);
  }

  const job = await prisma.job.create({ data: sharedData });
  return Response.json(job, { status: 201 });
}
