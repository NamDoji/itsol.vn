import { NextRequest } from "next/server";
import { setAdminSessionWithRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!payload?.email || !payload.password) return Response.json({ error: "Missing credentials" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  // Primary: verify against DB hash
  if (user && verifyPassword(payload.password, user.passwordHash)) {
    await setAdminSessionWithRole(user.email, user.role);
    return Response.json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
  }

  // Fallback: accept env-configured credentials (handles env mismatch on first deploy)
  const envEmail = process.env.ADMIN_EMAIL;
  const envPass  = process.env.ADMIN_PASSWORD;
  if (envEmail && envPass && payload.email === envEmail && payload.password === envPass) {
    // Auto-sync hash in DB so next login uses DB path
    if (user) {
      const newHash = hashPassword(payload.password);
      await prisma.user.update({ where: { email: user.email }, data: { passwordHash: newHash } }).catch(() => {});
    } else {
      const newHash = hashPassword(payload.password);
      await prisma.user.create({ data: { email: envEmail, passwordHash: newHash, name: "ITSOL Admin", role: "admin" } }).catch(() => {});
    }
    await setAdminSessionWithRole(envEmail, "admin");
    return Response.json({ ok: true, user: { email: envEmail, name: "ITSOL Admin", role: "admin" } });
  }

  return Response.json({ error: "Invalid email or password" }, { status: 401 });
}
