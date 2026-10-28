import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJson, talentRequestSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const talent = await prisma.talent.findUnique({ where: { id: Number(id) } });
  if (!talent) return Response.json({ error: "Talent not found" }, { status: 404 });

  const parsed = parseJson(talentRequestSchema, await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;

  const record = await prisma.talentRequest.create({
    data: { ...parsed.data, talentId: talent.id }
  });
  return Response.json({ ok: true, id: record.id });
}
