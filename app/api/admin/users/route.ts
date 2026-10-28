import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/security";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  } | null;

  if (!body?.name || !body.email || !body.password) {
    return Response.json({ error: "name, email, and password are required" }, { status: 400 });
  }

  const role = (body.role === "hr" || body.role === "sales") ? body.role : "admin";

  try {
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: hashPassword(body.password),
        role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return Response.json(user, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
      return Response.json({ error: "Email already exists" }, { status: 409 });
    }
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
