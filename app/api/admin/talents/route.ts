import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson, talentSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return Response.json(
    await prisma.talent.findMany({
      orderBy: [{ status: "asc" }, { yearsExperience: "desc" }],
    })
  );
}

function prepareTalentData(data: ReturnType<typeof talentSchema.parse>) {
  const { dateOfBirth, contractStart, contractEnd, ...rest } = data;
  return {
    ...rest,
    dateOfBirth: dateOfBirth && dateOfBirth !== "" ? new Date(dateOfBirth) : null,
    contractStart: contractStart && contractStart !== "" ? new Date(contractStart) : null,
    contractEnd: contractEnd && contractEnd !== "" ? new Date(contractEnd) : null,
    // normalize empty strings to null for optional string fields
    fullName: rest.fullName || null,
    email: rest.email || null,
    phone: rest.phone || null,
    gender: rest.gender ?? null,
    idNumber: rest.idNumber || null,
    address: rest.address || null,
    department: rest.department || null,
    contractType: rest.contractType || null,
    contractNumber: rest.contractNumber || null,
    billingCurrency: rest.billingCurrency || "VND",
  };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = parseJson(talentSchema, await request.json().catch(() => null));
  if ("error" in parsed) return parsed.error;
  const talent = await prisma.talent.create({ data: prepareTalentData(parsed.data) });
  return Response.json(talent, { status: 201 });
}
