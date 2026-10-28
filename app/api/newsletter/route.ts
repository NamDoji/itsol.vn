import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema, parseJson } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const parsed = parseJson(newsletterSchema, await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { locale: parsed.data.locale },
    create: parsed.data
  });
  return Response.json({ ok: true, id: subscriber.id });
}
