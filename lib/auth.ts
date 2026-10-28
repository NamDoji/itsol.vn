import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { signValue } from "./security";

const COOKIE_NAME = "itsol_admin_session";

export function createSessionToken(email: string, role = "admin") {
  const payload = Buffer.from(JSON.stringify({ email, role, ts: Date.now() })).toString("base64url");
  return `${payload}.${signValue(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = signValue(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email: string;
      role: string;
      ts: number;
    };
    const maxAge = 1000 * 60 * 60 * 12;
    if (Date.now() - parsed.ts > maxAge) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function setAdminSession(email: string) {
  return setAdminSessionWithRole(email, "admin");
}

export async function setAdminSessionWithRole(email: string, role: string) {
  const cookieStore = await cookies();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  cookieStore.set(COOKIE_NAME, createSessionToken(email, role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && siteUrl.startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}
