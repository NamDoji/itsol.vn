import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body?.staffId || !body?.contractType || !body?.startDate) {
    return Response.json(
      { error: "staffId, contractType, and startDate are required" },
      { status: 400 }
    );
  }

  const staffId = Number(body.staffId);
  if (isNaN(staffId) || staffId <= 0) {
    return Response.json({ error: "Invalid staffId" }, { status: 400 });
  }

  // Verify staff exists
  const staff = await prisma.talent.findUnique({ where: { id: staffId } });
  if (!staff) {
    return Response.json({ error: "Staff not found" }, { status: 404 });
  }

  const toFloat = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(String(v));
    return isNaN(n) ? null : n;
  };

  const startDate = new Date(String(body.startDate));
  const endDate = body.endDate && body.endDate !== "" ? new Date(String(body.endDate)) : null;

  // Create the contract
  const contract = await prisma.staffContract.create({
    data: {
      staffId,
      contractNumber: body.contractNumber ? String(body.contractNumber).trim() : null,
      contractType: String(body.contractType),
      startDate,
      endDate,
      grossSalary: toFloat(body.grossSalary),
      netSalary: toFloat(body.netSalary),
      socialInsurance: toFloat(body.socialInsurance),
      healthInsurance: toFloat(body.healthInsurance),
      billingRate: toFloat(body.billingRate),
      notes: body.notes ? String(body.notes).trim() : null,
    },
  });

  // Update staff's current contract fields to reflect this new contract
  await prisma.talent.update({
    where: { id: staffId },
    data: {
      contractType: String(body.contractType),
      contractStart: startDate,
      contractEnd: endDate,
      contractNumber: body.contractNumber ? String(body.contractNumber).trim() : null,
      grossSalary: toFloat(body.grossSalary),
      netSalary: toFloat(body.netSalary),
    },
  });

  return Response.json(contract, { status: 201 });
}
