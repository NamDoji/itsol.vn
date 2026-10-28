import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const page = new URL(request.url).searchParams.get("page") ?? undefined;

  const blocks = await prisma.contentBlock.findMany({
    where: page ? { page } : undefined,
    orderBy: [{ page: "asc" }, { order: "asc" }],
  });

  return Response.json(blocks);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null) as {
    page: string;
    section: string;
    titleVi?: string;
    titleEn?: string;
    bodyVi?: string;
    bodyEn?: string;
    meta?: string;
    order?: number;
    published?: boolean;
  } | null;

  if (!body?.page || !body?.section) {
    return Response.json({ error: "page and section are required" }, { status: 400 });
  }

  const block = await prisma.contentBlock.create({
    data: {
      page: body.page,
      section: body.section,
      titleVi: body.titleVi,
      titleEn: body.titleEn,
      bodyVi: body.bodyVi,
      bodyEn: body.bodyEn,
      meta: body.meta,
      order: body.order ?? 0,
      published: body.published ?? true,
    },
  });

  return Response.json(block, { status: 201 });
}
