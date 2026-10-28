import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson, timesheetSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const timesheets = await prisma.timesheet.findMany({
    include: {
      talent: { select: { id: true, code: true, role: true, seniority: true } },
      project: { select: { id: true, name: true, clientName: true } },
    },
    orderBy: [{ month: "desc" }, { createdAt: "desc" }],
  });
  return Response.json(timesheets);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = parseJson(timesheetSchema, await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;
  return Response.json(await prisma.timesheet.create({ data: parsed.data }), { status: 201 });
}
