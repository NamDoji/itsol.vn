import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJson, staffingRequestSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const normalized = {
    companyName: raw?.companyName ?? raw?.company,
    contactPerson: raw?.contactPerson ?? raw?.name,
    email: raw?.email,
    phone: raw?.phone ?? "N/A",
    country: raw?.country,
    serviceModel: raw?.serviceModel ?? "Staffing",
    numberOfTalents: raw?.numberOfTalents ?? raw?.quantity ?? 1,
    role: raw?.role,
    seniority: raw?.seniority ?? "Middle/Senior",
    technologyStack: raw?.technologyStack ?? raw?.notes ?? raw?.role,
    englishLevel: raw?.englishLevel,
    japaneseLevel: raw?.japaneseLevel,
    startDate: raw?.startDate ?? raw?.timeline,
    duration: raw?.duration,
    budgetRange: raw?.budgetRange,
    jobDescription: raw?.jobDescription,
    notes: raw?.notes
  };
  const parsed = parseJson(staffingRequestSchema, normalized);
  if ("error" in parsed) return parsed.error;

  const { consent: _consent, ...data } = parsed.data;
  const record = await prisma.staffingRequest.create({ data });
  return Response.json({ ok: true, id: record.id });
}
