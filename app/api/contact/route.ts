import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema, parseJson } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const parsed = parseJson(contactSchema, await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;

  const contact = await prisma.contactRequest.create({ data: parsed.data });
  return Response.json({ ok: true, id: contact.id });
}
