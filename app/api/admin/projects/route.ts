import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const projects = await prisma.project.findMany({
    include: {
      assignments: {
        include: {
          talent: { select: { id: true, code: true, role: true, seniority: true, status: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(projects);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.clientName) {
    return Response.json({ error: "name and clientName required" }, { status: 400 });
  }
  const data: Record<string, unknown> = {
    name:           String(body.name).trim(),
    clientName:     String(body.clientName).trim(),
    clientEmail:    body.clientEmail   ? String(body.clientEmail).trim()   : null,
    clientPhone:    body.clientPhone   ? String(body.clientPhone).trim()   : null,
    contractNumber: body.contractNumber? String(body.contractNumber).trim(): null,
    projectType:    body.projectType   ? String(body.projectType)          : "Staffing",
    contractValue:  body.contractValue ? Number(body.contractValue)        : null,
    description:    body.description   ? String(body.description).trim()   : null,
    status:         body.status        ? String(body.status)               : "active",
    currency:       body.currency      ? String(body.currency)             : "VND",
    isBackOffice:   body.isBackOffice === true || body.isBackOffice === "true",
    overheadRate:   body.overheadRate  ? Number(body.overheadRate)         : 0.30,
  };
  if (body.startDate && body.startDate !== "") data.startDate = new Date(String(body.startDate));
  if (body.endDate   && body.endDate   !== "") data.endDate   = new Date(String(body.endDate));
  const project = await prisma.project.create({ data: data as Parameters<typeof prisma.project.create>[0]["data"] });
  return Response.json(project, { status: 201 });
}
