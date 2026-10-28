import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/admin/seed-demo
 * Tạo dữ liệu demo: Projects, Assignments, Timesheets
 * Chỉ chạy khi DB chưa có project nào.
 */
export async function POST() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const existingCount = await prisma.project.count();
  if (existingCount > 0) {
    return Response.json({ ok: false, message: "Demo data already exists. Delete existing projects first." }, { status: 409 });
  }

  // Lấy danh sách talent hiện có
  const talents = await prisma.talent.findMany({ orderBy: { id: "asc" } });
  if (talents.length < 3) {
    return Response.json({ ok: false, message: "Need at least 3 talents in DB. Run talent seed first." }, { status: 422 });
  }

  // ── Tạo Projects ──────────────────────────────────────────────
  const project1 = await prisma.project.create({
    data: {
      name: "Web Portal ERP",
      clientName: "FPT Software",
      clientEmail: "pm@fpt.com.vn",
      status: "active",
      startDate: new Date("2025-01-01"),
      rate: "1,800 USD/tháng/người",
      currency: "USD",
      description: "Xây dựng web portal quản lý ERP nội bộ cho FPT Software",
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile Banking App",
      clientName: "ViettelPay",
      clientEmail: "tech@viettelpay.vn",
      status: "active",
      startDate: new Date("2025-03-01"),
      rate: "2,200 USD/tháng/người",
      currency: "USD",
      description: "Phát triển ứng dụng mobile banking thế hệ mới",
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "API Integration Platform",
      clientName: "Techcombank",
      clientEmail: "it@techcombank.com.vn",
      status: "completed",
      startDate: new Date("2024-06-01"),
      endDate: new Date("2025-02-28"),
      rate: "45,000,000 VND/tháng/người",
      currency: "VND",
      description: "Tích hợp API payment gateway với các đối tác",
    },
  });

  // ── Gán nhân sự vào dự án ─────────────────────────────────────
  // Project 1: FPT — dùng talent 0,1,2
  const t1 = talents[0], t2 = talents[1], t3 = talents[2];
  const t4 = talents[3] ?? talents[0];
  const t5 = talents[4] ?? talents[1];
  const t6 = talents[5] ?? talents[2];

  const a1 = await prisma.projectAssignment.create({
    data: { projectId: project1.id, talentId: t1.id, role: "Backend Developer", status: "active", startDate: new Date("2025-01-01") },
  });
  const a2 = await prisma.projectAssignment.create({
    data: { projectId: project1.id, talentId: t2.id, role: "Frontend Developer", status: "active", startDate: new Date("2025-01-01") },
  });
  const a3 = await prisma.projectAssignment.create({
    data: { projectId: project1.id, talentId: t3.id, role: "QA Engineer", status: "active", startDate: new Date("2025-02-01") },
  });

  // Project 2: ViettelPay — dùng talent 3,4,5
  const a4 = await prisma.projectAssignment.create({
    data: { projectId: project2.id, talentId: t4.id, role: "Mobile Developer (React Native)", status: "active", startDate: new Date("2025-03-01") },
  });
  const a5 = await prisma.projectAssignment.create({
    data: { projectId: project2.id, talentId: t5.id, role: "Backend Developer (Node.js)", status: "active", startDate: new Date("2025-03-01") },
  });

  // Project 3: Techcombank — dùng talent 0, 5 (ended)
  const a6 = await prisma.projectAssignment.create({
    data: { projectId: project3.id, talentId: t6.id, role: "DevOps Engineer", status: "ended", startDate: new Date("2024-06-01"), endDate: new Date("2025-02-28") },
  });

  // ── Tạo Timesheets ─────────────────────────────────────────────
  // Project 1 — FPT: 3 tháng gần nhất
  const tsData = [
    // Project 1
    { talentId: t1.id, projectId: project1.id, clientName: "FPT Software", month: "2025-04", workingDays: 22, approvedDays: 22, overtimeHours: 4, status: "ClientApproved" as const, clientRating: 5, note: "Hoàn thành sprint 8" },
    { talentId: t2.id, projectId: project1.id, clientName: "FPT Software", month: "2025-04", workingDays: 22, approvedDays: 22, overtimeHours: 0, status: "ClientApproved" as const, clientRating: 4 },
    { talentId: t3.id, projectId: project1.id, clientName: "FPT Software", month: "2025-04", workingDays: 22, approvedDays: 20, overtimeHours: 0, status: "BODApproved" as const, note: "Nghỉ 2 ngày phép" },
    { talentId: t1.id, projectId: project1.id, clientName: "FPT Software", month: "2025-05", workingDays: 23, approvedDays: 23, overtimeHours: 8, status: "HRSubmitted" as const },
    { talentId: t2.id, projectId: project1.id, clientName: "FPT Software", month: "2025-05", workingDays: 23, approvedDays: 23, overtimeHours: 0, status: "HRSubmitted" as const },
    { talentId: t3.id, projectId: project1.id, clientName: "FPT Software", month: "2025-05", workingDays: 23, approvedDays: 23, overtimeHours: 0, status: "Draft" as const },
    // Project 2
    { talentId: t4.id, projectId: project2.id, clientName: "ViettelPay", month: "2025-04", workingDays: 22, approvedDays: 22, overtimeHours: 12, status: "Invoiced" as const, clientRating: 5, invoiceRef: "INV-2025-042" },
    { talentId: t5.id, projectId: project2.id, clientName: "ViettelPay", month: "2025-04", workingDays: 22, approvedDays: 22, overtimeHours: 6, status: "Invoiced" as const, clientRating: 4, invoiceRef: "INV-2025-043" },
    { talentId: t4.id, projectId: project2.id, clientName: "ViettelPay", month: "2025-05", workingDays: 23, approvedDays: 23, overtimeHours: 4, status: "CHRMApproved" as const },
    { talentId: t5.id, projectId: project2.id, clientName: "ViettelPay", month: "2025-05", workingDays: 23, approvedDays: 22, overtimeHours: 0, status: "CHRMApproved" as const, note: "Vắng 1 ngày" },
    // Project 3 — Techcombank (completed)
    { talentId: t6.id, projectId: project3.id, clientName: "Techcombank", month: "2025-02", workingDays: 20, approvedDays: 20, overtimeHours: 0, status: "Invoiced" as const, clientRating: 5, invoiceRef: "INV-2025-021", approvedBy: "Nguyễn Văn BOD" },
  ];

  const timesheets = await Promise.all(
    tsData.map(d => prisma.timesheet.create({ data: d }))
  );

  return Response.json({
    ok: true,
    created: {
      projects: 3,
      assignments: 6,
      timesheets: timesheets.length,
    },
    projects: [
      { id: project1.id, name: project1.name },
      { id: project2.id, name: project2.name },
      { id: project3.id, name: project3.name },
    ],
  });
}
