import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return Response.json(await prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as { id?: number; status?: "new" | "contacted" | "qualified" | "closed" } | null;
  if (!body?.id || !body.status) return Response.json({ error: "Invalid body" }, { status: 400 });
  return Response.json(await prisma.contactRequest.update({ where: { id: body.id }, data: { status: body.status } }));
}
