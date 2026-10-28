import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const applications = await prisma.jobApplication.findMany({
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });
  // Strip base64 cv data for listing (return only metadata)
  const sanitized = applications.map((app) => ({
    ...app,
    cvUrl: app.cvUrl
      ? app.cvUrl.startsWith("data:filename=")
        ? `__file__:${app.cvUrl.split(";")[0].replace("data:filename=", "")}`
        : app.cvUrl
      : null,
  }));
  return Response.json(sanitized);
}

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.email) return Response.json({ error: "name và email là bắt buộc" }, { status: 400 });
  const app = await prisma.jobApplication.create({
    data: {
      name:     String(body.name),
      email:    String(body.email),
      phone:    body.phone    ? String(body.phone)    : null,
      position: body.position ? String(body.position) : "Không xác định",
      jobId:    body.jobId    ? Number(body.jobId)    : null,
      message:  body.message  ? String(body.message)  : null,
      status:   "new",
      candidateStatus: "Received",
    },
  });
  return Response.json(app, { status: 201 });
}
