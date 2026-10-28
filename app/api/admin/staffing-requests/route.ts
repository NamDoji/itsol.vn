import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return Response.json(
    await prisma.staffingRequest.findMany({
      include: { talentRequests: { include: { talent: true } } },
      orderBy: { createdAt: "desc" },
    })
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const { clientName, email, phone, service, roles, timeline, budget, message, status } = body as {
    clientName?: string; email?: string; phone?: string; service?: string;
    roles?: string; timeline?: string; budget?: string; message?: string;
    status?: string;
  };

  if (!clientName || !email) {
    return Response.json({ error: "clientName and email are required" }, { status: 400 });
  }

  const created = await prisma.staffingRequest.create({
    data: {
      companyName:     String(clientName),
      contactPerson:   String(clientName),
      email:           String(email),
      phone:           phone       ? String(phone)    : "",
      serviceModel:    service     ? String(service)   : "",
      numberOfTalents: 1,
      role:            roles       ? String(roles)     : "",
      seniority:       "Mid",
      technologyStack: "",
      duration:        timeline    ? String(timeline)  : null,
      budgetRange:     budget      ? String(budget)    : null,
      notes:           message     ? String(message)   : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(status && { status: status as any }),
    },
  });

  return Response.json(created, { status: 201 });
}
