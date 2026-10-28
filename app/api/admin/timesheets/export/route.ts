/**
 * GET /api/admin/timesheets/export?projectId=1&month=2025-06
 * Export timesheets ra file Excel
 */
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const month     = searchParams.get("month");

  if (!projectId || !month) {
    return Response.json({ error: "projectId và month là bắt buộc" }, { status: 400 });
  }

  // Lấy project info
  const project = await prisma.project.findUnique({
    where: { id: Number(projectId) },
    select: { name: true, clientName: true, overheadRate: true },
  });

  // Lấy timesheets + talent info
  const timesheets = await prisma.timesheet.findMany({
    where: { projectId: Number(projectId), month },
    include: {
      talent: {
        select: { id: true, code: true, fullName: true, role: true, seniority: true,
                  grossSalary: true, billingRate: true, billingCurrency: true },
      },
    },
    orderBy: { id: "asc" },
  });

  // Lấy assignment info (billingRate fallback)
  const assignments = await prisma.projectAssignment.findMany({
    where: { projectId: Number(projectId) },
    select: { talentId: true, grossSalary: true, billingRate: true, billingCurrency: true, role: true },
  });
  const asgnMap = new Map(assignments.map(a => [a.talentId, a]));

  const overheadRate = Number(project?.overheadRate ?? 0.3);

  // ── Build rows ──────────────────────────────────────────────────
  const headers = [
    "STT", "Mã NV", "Họ và tên", "Vị trí", "Seniority",
    "Ngày Công", "Ngày Duyệt", "OT (giờ)",
    "Lương Gross", "Bill KH", "Currency",
    "THU", "CHI (Gross)", "Back Office (30%)", "Tổng Chi", "LÃI/LỖ", "% Margin",
    "Trạng thái", "Ghi chú", "Người duyệt", "Số HĐ",
  ];

  const dataRows = timesheets.map((ts, idx) => {
    const asgn = asgnMap.get(ts.talentId);
    const talent = ts.talent;

    // Effective values: timesheet → assignment → talent
    const gross   = (ts.grossSalary  ?? asgn?.grossSalary  ?? talent?.grossSalary  ?? 0) as number;
    const bill    = (ts.billingRate   ?? asgn?.billingRate   ?? talent?.billingRate   ?? 0) as number;
    const currency = ts.billingCurrency ?? asgn?.billingCurrency ?? "VND";
    const workingDays  = ts.workingDays  ?? 22;
    const approvedDays = ts.approvedDays ?? 0;
    const overtime     = ts.overtimeHours ?? 0;

    // THU = Bill × (Ngày Duyệt + OT) / Ngày Công
    const revenue   = workingDays > 0 ? bill  * (approvedDays + overtime) / workingDays : 0;
    // CHI = Gross × (Ngày Duyệt + OT) / Ngày Công
    const cost      = workingDays > 0 ? gross * (approvedDays + overtime) / workingDays : 0;
    const overhead  = cost * overheadRate;
    const totalCost = cost + overhead;
    const profit    = revenue - totalCost;
    const margin    = revenue > 0 ? (profit / revenue * 100) : 0;

    return [
      idx + 1,
      talent?.code ?? "",
      talent?.fullName ?? talent?.code ?? "",
      talent?.role ?? "",
      talent?.seniority ?? "",
      workingDays,
      approvedDays,
      overtime,
      gross,
      bill,
      currency,
      Math.round(revenue),
      Math.round(cost),
      Math.round(overhead),
      Math.round(totalCost),
      Math.round(profit),
      Math.round(margin * 10) / 10,
      ts.status ?? "",
      ts.note ?? "",
      ts.approvedBy ?? "",
      ts.invoiceRef ?? "",
    ];
  });

  // ── Totals row ─────────────────────────────────────────────────
  const col = (colIdx: number) => dataRows.reduce((s, r) => s + (Number(r[colIdx]) || 0), 0);
  const totalRevenue = col(11), totalCost2 = col(14), totalProfit = col(15);
  const totalsRow = [
    "TỔNG", "", "", "", "",
    col(5), col(6), col(7),  // workingDays, approvedDays, OT
    col(8), col(9), "",       // gross sum, bill sum
    Math.round(totalRevenue),
    Math.round(col(12)),
    Math.round(col(13)),
    Math.round(totalCost2),
    Math.round(totalProfit),
    totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 1000) / 10 : 0,
    "", "", "", "",
  ];

  // ── Build worksheet ────────────────────────────────────────────
  const wb = XLSX.utils.book_new();

  // Sheet 1: Timesheets
  const sheetName = `Timesheets ${month}`;
  const ws = XLSX.utils.aoa_to_sheet([
    // Title rows
    [`BẢNG CHẤM CÔNG & DOANH THU — ${project?.clientName ?? ""} — ${project?.name ?? ""}`],
    [`Tháng: ${month}    Overhead Back Office: ${Math.round(overheadRate * 100)}%    Xuất: ${new Date().toLocaleDateString("vi-VN")}`],
    [],
    headers,
    ...dataRows,
    [],
    totalsRow,
  ]);

  // Merge title
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
  ];

  // Column widths
  ws["!cols"] = [
    { wch: 5 }, { wch: 10 }, { wch: 20 }, { wch: 22 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 8 },
    { wch: 14 }, { wch: 14 }, { wch: 8 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
    { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const fileName = `Timesheets_${project?.clientName?.replace(/\s/g,"_") ?? "ITSOL"}_${month}.xlsx`;

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "no-store",
    },
  });
}
