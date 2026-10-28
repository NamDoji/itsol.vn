import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJson, productInquirySchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const parsed = parseJson(productInquirySchema, await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;
  const inquiry = await prisma.productInquiry.create({ data: parsed.data });
  return Response.json({ ok: true, id: inquiry.id });
}
