import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/admin/timesheets/batch
 * Auto-tạo timesheets cho toàn bộ nhân sự trong 1 dự án cho 1 tháng.
 * Body: { projectId: number, month: "YYYY-MM", workingDays?: number }
 * - Nếu timesheet đã tồn tại (cùng talentId + projectId + month) → skip
 * - Salary/billing snapshot từ ProjectAssignment
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body?.projectId || !body?.month) {
    return Response.json({ error: "projectId and month required" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}$/.test(String(body.month))) {
    return Response.json({ error: "month must be YYYY-MM" }, { status: 400 });
  }

  const projectId = Number(body.projectId);
  const month = String(body.month);

  // Tính số ngày làm việc mặc định của tháng nếu không truyền vào
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  // Ước lượng ngày công: loại Chủ nhật
  let defaultWorkingDays = body.workingDays ? Number(body.workingDays) : 0;
  if (!defaultWorkingDays) {
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(y, m - 1, d).getDay();
      if (dow !== 0) defaultWorkingDays++; // bỏ Chủ nhật
    }
  }

  // Lấy project + assignments
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      assignments: {
        where: { status: "active" },
        include: {
          talent: { select: { id: true, code: true, role: true, seniority: true, fullName: true, grossSalary: true, billingRate: true, billingCurrency: true } },
        },
      },
    },
  });
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });
  if (!project.assignments.length) {
    return Response.json({ error: "Dự án chưa có nhân sự nào (active)" }, { status: 422 });
  }

  // Lấy timesheets đã có để skip
  const existing = await prisma.timesheet.findMany({
    where: { projectId, month },
    select: { talentId: true },
  });
  const existingSet = new Set(existing.map(e => e.talentId));

  const created: number[] = [];
  const skipped: number[] = [];

  for (const assignment of project.assignments) {
    const talentId = assignment.talentId;
    if (existingSet.has(talentId)) {
      skipped.push(talentId);
      continue;
    }
    const ts = await prisma.timesheet.create({
      data: {
        talentId,
        projectId,
        clientName: project.clientName,
        month,
        workingDays: defaultWorkingDays,
        approvedDays: defaultWorkingDays,
        overtimeHours: 0,
        status: "Draft",
        // Snapshot salary/billing từ assignment
        grossSalary:     assignment.grossSalary   ?? assignment.talent?.grossSalary   ?? null,
        billingRate:     assignment.billingRate    ?? assignment.talent?.billingRate    ?? null,
        billingCurrency: assignment.billingCurrency ?? assignment.talent?.billingCurrency ?? "VND",
      },
    });
    created.push(ts.id);
  }

  return Response.json({
    ok: true,
    month,
    projectId,
    projectName: project.name,
    workingDays: defaultWorkingDays,
    created: created.length,
    skipped: skipped.length,
    totalStaff: project.assignments.length,
  });
}

/**
 * GET /api/admin/timesheets/batch?projectId=1&month=2025-06
 * Lấy tất cả timesheets của dự án trong tháng, kèm talent + assignment info
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const month = searchParams.get("month");

  if (!projectId || !month) {
    return Response.json({ error: "projectId and month required" }, { status: 400 });
  }

  const timesheets = await prisma.timesheet.findMany({
    where: { projectId: Number(projectId), month },
    include: {
      talent: { select: { id: true, code: true, role: true, seniority: true, fullName: true, grossSalary: true, netSalary: true, billingRate: true, billingCurrency: true } },
      project: { select: { id: true, name: true, clientName: true, projectType: true, overheadRate: true } },
    },
    orderBy: { id: "asc" },
  });

  // Lấy thêm assignment info (billingRate/grossSalary nếu chưa có trong timesheet)
  const assignments = await prisma.projectAssignment.findMany({
    where: { projectId: Number(projectId), status: "active" },
    select: { talentId: true, grossSalary: true, billingRate: true, billingCurrency: true, role: true },
  });
  const assignmentMap = new Map(assignments.map(a => [a.talentId, a]));

  const rows = timesheets.map(ts => {
    const asgn = assignmentMap.get(ts.talentId);
    return {
      ...ts,
      // Effective rates: timesheet → assignment → talent (company staff)
      effectiveGross:    ts.grossSalary  ?? asgn?.grossSalary  ?? ((ts.talent as Record<string,unknown>)?.grossSalary as number ?? null),
      effectiveBilling:  ts.billingRate  ?? asgn?.billingRate  ?? ((ts.talent as Record<string,unknown>)?.billingRate as number ?? null),
      effectiveCurrency: ts.billingCurrency ?? asgn?.billingCurrency ?? "VND",
      assignmentRole: asgn?.role ?? null,
    };
  });

  return Response.json({ rows, month, projectId: Number(projectId) });
}
