import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJson, staffingRequestSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const parsed = parseJson(staffingRequestSchema, await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;

  const { consent: _consent, ...data } = parsed.data;
  const record = await prisma.staffingRequest.create({ data });
  return Response.json({ ok: true, id: record.id, message: "Staffing request saved. Email notification mock queued." });
}
