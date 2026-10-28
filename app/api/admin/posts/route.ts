import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blogSchema, parseJson } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return Response.json(await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = parseJson(blogSchema, await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;
  return Response.json(await prisma.blogPost.create({ data: parsed.data }), { status: 201 });
}
