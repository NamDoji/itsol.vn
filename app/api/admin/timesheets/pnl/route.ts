import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ── GET /api/admin/timesheets/pnl?month=2025-05&projectId=1 ─────────────────
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // e.g. "2025-05"
  const projectIdParam = searchParams.get("projectId");

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return Response.json(
      { error: "month is required and must be in YYYY-MM format (e.g. 2025-05)" },
      { status: 400 }
    );
  }
  if (!projectIdParam) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  const projectId = Number(projectIdParam);
  if (isNaN(projectId)) {
    return Response.json({ error: "projectId must be a number" }, { status: 400 });
  }

  // Fetch project
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch all timesheets for this project in the given month
  const timesheets = await prisma.timesheet.findMany({
    where: { projectId, month },
    include: {
      talent: {
        select: {
          id: true,
          code: true,
          role: true,
          seniority: true,
          grossSalary: true,
          netSalary: true,
        },
      },
    },
  });

  if (!timesheets.length) {
    return Response.json(
      {
        projectId,
        projectName: project.name,
        clientName: project.clientName,
        month,
        revenue: 0,
        directCost: 0,
        backOfficeOverhead: 0,
        totalCost: 0,
        profit: 0,
        margin: null,
        currency: project.currency,
        rows: [],
        message: "No timesheets found for this project and month",
      },
      { status: 200 }
    );
  }

  // For each timesheet, look up the assignment to get billingRate & grossSalary (override)
  const overheadRate = project.overheadRate ?? 0.3;

  const rows: {
    talentId: number;
    talentCode: string;
    talentRole: string;
    workingDays: number;
    approvedDays: number;
    billingRate: number | null;
    billingCurrency: string;
    grossSalary: number | null;
    revenue: number;
    directCost: number;
    backOfficeOverhead: number;
    totalCost: number;
    profit: number;
    margin: number | null;
  }[] = [];

  for (const ts of timesheets) {
    const talentId = ts.talentId;
    const workingDays = ts.workingDays || 1; // avoid division by zero
    const approvedDays = ts.approvedDays ?? 0;
    const ratio = workingDays > 0 ? approvedDays / workingDays : 0;

    // Find the active assignment for this talent on this project
    const assignment = await prisma.projectAssignment.findFirst({
      where: { talentId, projectId },
      orderBy: { createdAt: "desc" },
    });

    // billingRate: use assignment override, fallback null
    const billingRate = assignment?.billingRate ?? null;
    const billingCurrency = assignment?.billingCurrency ?? "VND";

    // grossSalary: use assignment override, then talent's own grossSalary
    const grossSalary =
      assignment?.grossSalary ?? ts.talent.grossSalary ?? null;

    // Revenue = billingRate × (approvedDays / workingDays)
    const revenue = billingRate != null ? billingRate * ratio : 0;

    // Direct cost = grossSalary × (approvedDays / workingDays)
    const directCost = grossSalary != null ? grossSalary * ratio : 0;

    // Back-office overhead allocation
    const backOfficeOverhead = directCost * overheadRate;

    const totalCost = directCost + backOfficeOverhead;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : null;

    rows.push({
      talentId,
      talentCode: ts.talent.code,
      talentRole: ts.talent.role,
      workingDays: ts.workingDays,
      approvedDays,
      billingRate,
      billingCurrency,
      grossSalary,
      revenue,
      directCost,
      backOfficeOverhead,
      totalCost,
      profit,
      margin: margin != null ? parseFloat(margin.toFixed(2)) : null,
    });
  }

  // Aggregate totals
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalDirectCost = rows.reduce((s, r) => s + r.directCost, 0);
  const totalBackOfficeOverhead = rows.reduce((s, r) => s + r.backOfficeOverhead, 0);
  const totalTotalCost = rows.reduce((s, r) => s + r.totalCost, 0);
  const totalProfit = totalRevenue - totalTotalCost;
  const totalMargin =
    totalRevenue > 0
      ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(2))
      : null;

  return Response.json({
    projectId,
    projectName: project.name,
    clientName: project.clientName,
    month,
    overheadRate,
    revenue: totalRevenue,
    directCost: totalDirectCost,
    backOfficeOverhead: totalBackOfficeOverhead,
    totalCost: totalTotalCost,
    profit: totalProfit,
    margin: totalMargin,
    currency: project.currency,
    rows,
  });
}
