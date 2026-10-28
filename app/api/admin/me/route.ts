import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  return Response.json({ authenticated: Boolean(session), session });
}
