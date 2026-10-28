import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const toFloat = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const contractId = Number(id);
  if (isNaN(contractId) || contractId <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

  // Check contract exists
  const existing = await prisma.staffContract.findUnique({ where: { id: contractId } });
  if (!existing) return Response.json({ error: "Contract not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.contractNumber !== undefined)
    data.contractNumber = body.contractNumber ? String(body.contractNumber).trim() : null;
  if (body.contractType !== undefined)
    data.contractType = String(body.contractType);
  if (body.startDate !== undefined)
    data.startDate = new Date(String(body.startDate));
  if (body.endDate !== undefined)
    data.endDate = body.endDate && body.endDate !== "" ? new Date(String(body.endDate)) : null;
  if (body.grossSalary !== undefined) data.grossSalary = toFloat(body.grossSalary);
  if (body.netSalary !== undefined) data.netSalary = toFloat(body.netSalary);
  if (body.socialInsurance !== undefined) data.socialInsurance = toFloat(body.socialInsurance);
  if (body.healthInsurance !== undefined) data.healthInsurance = toFloat(body.healthInsurance);
  if (body.billingRate !== undefined) data.billingRate = toFloat(body.billingRate);
  if (body.notes !== undefined)
    data.notes = body.notes ? String(body.notes).trim() : null;

  const contract = await prisma.staffContract.update({
    where: { id: contractId },
    data,
  });

  return Response.json(contract);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const contractId = Number(id);
  if (isNaN(contractId) || contractId <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.staffContract.findUnique({ where: { id: contractId } });
  if (!existing) return Response.json({ error: "Contract not found" }, { status: 404 });

  await prisma.staffContract.delete({ where: { id: contractId } });
  return Response.json({ ok: true });
}
