import { NextRequest } from "next/server";
import { deleteById, listTable, readJson, upsertById } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
const allowed = ["slug", "title_vi", "title_en", "excerpt_vi", "excerpt_en", "content_vi", "content_en", "category", "published"];

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return Response.json(await listTable("blog_posts", "created_at DESC"));
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const payload = await readJson<Record<string, unknown>>(request);
  if (!payload) return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  return Response.json(await upsertById("blog_posts", payload, allowed));
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await deleteById("blog_posts", id);
  return Response.json({ ok: true });
}
