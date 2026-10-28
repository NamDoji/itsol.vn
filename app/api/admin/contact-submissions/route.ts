import { listTable } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return Response.json(await listTable("contact_submissions", "created_at DESC"));
}
