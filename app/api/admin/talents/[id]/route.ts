import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson, talentSchema } from "@/lib/validations";

export const runtime = "nodejs";

function prepareTalentData(data: Partial<ReturnType<typeof talentSchema.parse>>) {
  const { dateOfBirth, contractStart, contractEnd, ...rest } = data;
  const out: Record<string, unknown> = { ...rest };
  if (dateOfBirth !== undefined)
    out.dateOfBirth = dateOfBirth && dateOfBirth !== "" ? new Date(dateOfBirth) : null;
  if (contractStart !== undefined)
    out.contractStart = contractStart && contractStart !== "" ? new Date(contractStart) : null;
  if (contractEnd !== undefined)
    out.contractEnd = contractEnd && contractEnd !== "" ? new Date(contractEnd) : null;
  // normalize empty strings to null for optional string fields
  if ("email" in out && !out.email) out.email = null;
  if ("billingCurrency" in out && !out.billingCurrency) out.billingCurrency = "VND";
  return out;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const talent = await prisma.talent.findUnique({
    where: { id: Number(id) },
    include: {
      contracts: { orderBy: { startDate: "desc" } },
    },
  });
  if (!talent) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(talent);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = parseJson(talentSchema.partial(), await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;
  const talent = await prisma.talent.update({
    where: { id: Number(id) },
    data: prepareTalentData(parsed.data),
  });
  return Response.json(talent);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.talent.delete({ where: { id: Number(id) } });
  return Response.json({ ok: true });
}
