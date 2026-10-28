/**
 * GET /api/admin/staffing-requests/template
 * Download Excel template for staffing request bulk import.
 * Columns: clientName, email, phone, service, roles, timeline, budget, message
 */
import { requireAdmin } from "@/lib/auth";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

const HEADERS = [
  "clientName",
  "email",
  "phone",
  "service",
  "roles",
  "timeline",
  "budget",
  "message",
];

const EXAMPLE_ROWS = [
  [
    "Công ty ABC Technology",
    "hr@abctech.vn",
    "0912345678",
    "IT Staffing",
    "Backend Developer (Node.js/TypeScript)",
    "3 months, starting July 2025",
    "$3,000–$4,000/month",
    "We need 2 senior backend devs for a fintech project. Remote OK.",
  ],
  [
    "XYZ Solutions Ltd",
    "talent@xyzsolutions.com",
    "0987654321",
    "Dedicated Team",
    "Frontend Developer (React), QA Engineer",
    "6 months",
    "$5,000–$7,000/month for the team",
    "Building a SaaS platform. Need strong React and automated testing skills.",
  ],
  [
    "Global Ventures Inc.",
    "cto@globalventures.io",
    "+1-415-555-0100",
    "Project-based",
    "Full-stack Developer (Next.js + PostgreSQL)",
    "Fixed 3-month project",
    "Negotiable",
    "E-commerce migration project. Tight deadline.",
  ],
];

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Template data
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...EXAMPLE_ROWS]);

  // Column widths
  ws["!cols"] = [
    { wch: 28 }, // clientName
    { wch: 30 }, // email
    { wch: 16 }, // phone
    { wch: 20 }, // service
    { wch: 40 }, // roles
    { wch: 30 }, // timeline
    { wch: 24 }, // budget
    { wch: 60 }, // message
  ];

  // Freeze header row
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(wb, ws, "Staffing Requests");

  // Sheet 2: Instructions
  const guide: (string | number)[][] = [
    ["HƯỚNG DẪN NHẬP LIỆU — Staffing Requests"],
    [""],
    ["CỘT BẮT BUỘC:", "clientName, email"],
    [""],
    ["CỘT", "MÔ TẢ"],
    ["clientName", "Tên công ty / khách hàng"],
    ["email",      "Email liên hệ (dùng để kiểm tra trùng lặp — skip nếu đã tồn tại)"],
    ["phone",      "Số điện thoại"],
    ["service",    "Loại dịch vụ (IT Staffing / Dedicated Team / Project-based / ...)"],
    ["roles",      "Vị trí cần tuyển (mô tả chi tiết, có thể nhiều vị trí)"],
    ["timeline",   "Thời gian / timeline mong muốn"],
    ["budget",     "Ngân sách dự kiến"],
    ["message",    "Yêu cầu chi tiết, ghi chú thêm"],
    [""],
    ["LƯU Ý:"],
    ["  • Upsert theo email: nếu email đã tồn tại trong hệ thống sẽ bị SKIP (không cập nhật)"],
    ["  • Xóa các dòng ví dụ trước khi import dữ liệu thật"],
    ["  • Upload file qua Admin → Staffing Requests → Import"],
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet(guide);
  wsGuide["!cols"] = [{ wch: 18 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, "Hướng dẫn");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="staffing-requests-import-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
