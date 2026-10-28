import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

// ─── GET /api/timesheets?code=DEV001 ──────────────────────────────
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();
  if (!code) {
    return Response.json({ error: "Missing talent code" }, { status: 400 });
  }

  const talent = await prisma.talent.findUnique({
    where: { code },
    select: { id: true, code: true, role: true, seniority: true },
  });

  if (!talent) {
    return Response.json({ error: "Talent not found" }, { status: 404 });
  }

  const timesheets = await prisma.timesheet.findMany({
    where: { talentId: talent.id },
    orderBy: { month: "desc" },
    select: {
      id: true,
      clientName: true,
      month: true,
      workingDays: true,
      approvedDays: true,
      overtimeHours: true,
      status: true,
      note: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({ talent, timesheets });
}

// ─── POST /api/timesheets ─────────────────────────────────────────
const createSchema = z.object({
  talentCode: z.string().min(1).max(50),
  clientName: z.string().min(1).max(160),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM"),
  workingDays: z.coerce.number().int().min(0).max(31),
  overtimeHours: z.coerce.number().int().min(0).max(240).default(0),
  note: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { talentCode, clientName, month, workingDays, overtimeHours, note } = parsed.data;

  const talent = await prisma.talent.findUnique({ where: { code: talentCode } });
  if (!talent) {
    return Response.json({ error: "Talent not found" }, { status: 404 });
  }

  const timesheet = await prisma.timesheet.create({
    data: {
      talentId: talent.id,
      clientName,
      month,
      workingDays,
      approvedDays: 0,
      overtimeHours,
      status: "Draft",
      note: note ?? null,
    },
  });

  return Response.json(timesheet, { status: 201 });
}
