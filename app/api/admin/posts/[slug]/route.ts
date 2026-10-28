import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blogSchema, parseJson } from "@/lib/validations";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { slug } = await params;
  const parsed = parseJson(blogSchema.partial(), await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;
  return Response.json(await prisma.blogPost.update({ where: { slug }, data: parsed.data }));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { slug } = await params;
  await prisma.blogPost.delete({ where: { slug } });
  return Response.json({ ok: true });
}
