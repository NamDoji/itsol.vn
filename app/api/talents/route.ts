import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || undefined;
  const skill = searchParams.get("skill") || undefined;
  const status = searchParams.get("status") || undefined;

  const talents = await prisma.talent.findMany({
    where: {
      ...(role ? { role: { contains: role } } : {}),
      ...(skill ? { skills: { contains: skill } } : {}),
      ...(status ? { status: status as never } : {})
    },
    orderBy: [{ status: "asc" }, { yearsExperience: "desc" }]
  });

  return Response.json(talents);
}
