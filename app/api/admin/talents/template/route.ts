/**
 * GET /api/admin/talents/template
 * Download file Excel mẫu nhập nhân sự — chuẩn ITSOL
 * Tự động tính BHXH/BHYT/BHTN/Thuế TNCN khi nhập gross (dùng cột "grossSalary")
 */
import { requireAdmin } from "@/lib/auth";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

// ── Tính toán BHXH/BHYT theo luật VN (để làm ví dụ mẫu) ─────────
function calcVN(gross: number, dependents = 0) {
  const empTotal  = Math.round(gross * 0.105); // NLĐ: 8+1.5+1 = 10.5%
  const cdBHXH    = Math.round(gross * 0.175);
  const cdBHYT    = Math.round(gross * 0.03);
  const cdBHTN    = Math.round(gross * 0.01);
  const cdTotal   = cdBHXH + cdBHYT + cdBHTN; // CĐ: 17.5+3+1 = 21.5%
  const taxable   = Math.max(0, gross - empTotal - 11000000 - dependents * 4400000);
  const brackets: [number, number][] = [
    [5e6,.05],[5e6,.10],[8e6,.15],[14e6,.20],[20e6,.25],[28e6,.30],[Infinity,.35]
  ];
  let tax = 0, rem = taxable;
  for (const [cap, rate] of brackets) { if (rem <= 0) break; tax += Math.min(rem, cap) * rate; rem -= cap; }
  return { net: gross - empTotal - Math.round(tax), cdBHXH, cdBHYT, cdBHTN, totalCost: gross + cdTotal };
}

// ── Column headers ────────────────────────────────────────────────
const HEADERS_VI = [
  // Thông tin cơ bản
  "Mã NV (*)",                // code
  "Họ và tên",               // fullName
  "Ngày sinh (YYYY-MM-DD)",   // dateOfBirth
  "Giới tính (Nam/Nữ)",       // gender
  "Số điện thoại",            // phone
  "Email",                    // email
  "CMND/CCCD",                // idNumber
  "Địa chỉ",                  // address
  // Nghề nghiệp
  "Vị trí / Job title (*)",   // role
  "Phòng ban / Dự án",        // department
  "Seniority (*)",             // seniority (Junior/Mid/Senior/Lead)
  "Năm kinh nghiệm",          // yearsExperience
  "Skills (ngăn dấu phẩy)",   // skills
  "English level",            // englishLevel
  "Japanese level",           // japaneseLevel
  "Địa điểm làm việc",        // location
  "Work model",               // workingModel
  "Tình trạng",               // availability
  // Hợp đồng
  "Loại HĐ",                  // contractType
  "Số HĐ",                    // contractNumber
  "Ngày vào (HĐ bắt đầu)",    // contractStart
  "Ngày hết hạn HĐ",          // contractEnd
  // Lương & bảo hiểm
  "Lương GROSS (VND/tháng)",  // grossSalary
  "Lương NET (tự tính)",      // netSalary
  "BHXH phần CĐ (17.5%)",    // socialInsurance
  "BHYT phần CĐ (3%)",       // healthInsurance
  "BHTN phần CĐ (1%)",       // otherAllowance
  "Tổng chi phí công ty",     // totalCost
  // Bill khách hàng
  "Bill rate 1/tháng",        // billingRate
  "Bill rate 2/tháng (onsite)",// billingRate2
  "Currency (VND/USD)",       // billingCurrency
  // Ghi chú
  "Tóm tắt / Ghi chú",       // summary
];

const HEADERS_KEY = [
  "code","fullName","dateOfBirth","gender","phone","email","idNumber","address",
  "role","department","seniority","yearsExperience","skills","englishLevel","japaneseLevel",
  "location","workingModel","availability","contractType","contractNumber","contractStart","contractEnd",
  "grossSalary","netSalary","socialInsurance","healthInsurance","otherAllowance","totalCost",
  "billingRate","billingRate2","billingCurrency","summary",
];

// ── Ví dụ mẫu ────────────────────────────────────────────────────
function makeRow(gross: number, override: Record<string, unknown>) {
  const c = calcVN(gross);
  const base: Record<string, unknown> = {
    grossSalary:      gross,
    netSalary:        c.net,
    socialInsurance:  c.cdBHXH,
    healthInsurance:  c.cdBHYT,
    otherAllowance:   c.cdBHTN,
    totalCost:        c.totalCost,
    billingCurrency:  "VND",
    englishLevel:     "B2",
    japaneseLevel:    "None",
    workingModel:     "Remote",
    availability:     "Available",
    contractType:     "fulltime",
    seniority:        "Senior",
    gender:           "Nam",
    location:         "Hà Nội",
  };
  return { ...base, ...override };
}

const EXAMPLE_ROWS = [
  makeRow(30000000, {
    code: "DEV001", fullName: "Nguyễn Văn An",
    dateOfBirth: "1990-05-15", phone: "0912345678",
    email: "an.nv@itsol.vn", idNumber: "038090012345",
    address: "12 Phố Huế, Hai Bà Trưng, Hà Nội",
    role: "Backend Developer", department: "Engineering",
    seniority: "Senior", yearsExperience: 7,
    skills: "Node.js, TypeScript, PostgreSQL, Redis, Docker",
    contractType: "fulltime", contractNumber: "HGD-2024-001",
    contractStart: "2020-03-01",
    billingRate: 32000000, billingRate2: 45000000,
    summary: "Senior Backend Developer, 7 năm kinh nghiệm hệ thống tài chính, banking.",
  }),
  makeRow(20000000, {
    code: "FE002", fullName: "Trần Thị Bình",
    dateOfBirth: "1995-08-20", gender: "Nữ", phone: "0987654321",
    email: "binh.tt@itsol.vn", idNumber: "052095004321",
    address: "45 Trần Đại Nghĩa, Đống Đa, Hà Nội",
    role: "Frontend Developer", department: "Engineering",
    seniority: "Mid", yearsExperience: 3,
    skills: "React, Next.js, TypeScript, TailwindCSS",
    englishLevel: "B1", contractType: "fulltime",
    contractNumber: "HGD-2024-002", contractStart: "2022-06-01",
    billingRate: 22000000, billingRate2: 28000000,
    summary: "Frontend Developer chuyên React/Next.js, thiết kế UI đẹp.",
  }),
  makeRow(15000000, {
    code: "QA003", fullName: "Lê Văn Cường",
    dateOfBirth: "1993-02-10", phone: "0905551234",
    email: "cuong.lv@itsol.vn",
    role: "QA/Tester", department: "QA",
    seniority: "Mid", yearsExperience: 4,
    skills: "Selenium, Cypress, Jira, Postman, Python",
    contractType: "fulltime", contractNumber: "HGD-2024-003",
    contractStart: "2021-09-15",
    billingRate: 17000000, billingCurrency: "VND",
    summary: "QA Engineer, automation testing, kinh nghiệm banking & fintech.",
  }),
];

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Danh sách nhân sự ──
  const dataRows = EXAMPLE_ROWS.map(r => HEADERS_KEY.map(k => r[k] ?? ""));
  const ws1 = XLSX.utils.aoa_to_sheet([HEADERS_VI, ...dataRows]);

  // Column widths
  const colWidths = [12,22,18,12,14,28,16,32, 24,18,12,14,40,12,12,16,12,14, 14,16,14,14, 16,16,14,12,12,16, 16,16,10,40];
  ws1["!cols"] = colWidths.map(w => ({ wch: w }));

  // Freeze header row
  ws1["!freeze"] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(wb, ws1, "Danh sách nhân sự");

  // ── Sheet 2: Hướng dẫn ──
  const guide = [
    ["HƯỚNG DẪN NHẬP LIỆU — Chuẩn ITSOL"],
    [""],
    ["CỘT BẮT BUỘC (*):", "Mã NV (code) · Vị trí (role) · Seniority"],
    [""],
    ["LOẠI HỢP ĐỒNG:", "fulltime | parttime | probation | freelance | intern"],
    ["SENIORITY:", "Junior | Mid | Senior | Lead | Principal"],
    ["WORK MODEL:", "Remote | Onsite | Hybrid"],
    ["TÌNH TRẠNG:", "Available | Assigned | Onboarded | Inactive"],
    ["CURRENCY:", "VND | USD"],
    [""],
    ["TÍNH BHXH/BHYT TỰ ĐỘNG:", "Chỉ cần nhập Lương GROSS — hệ thống tự tính phần còn lại"],
    [""],
    ["CÔNG THỨC TÍNH (Luật VN 2024):"],
    ["  NLĐ đóng: BHXH 8% + BHYT 1.5% + BHTN 1% = 10.5% gross"],
    ["  Công ty đóng: BHXH 17.5% + BHYT 3% + BHTN 1% = 21.5% gross"],
    ["  Thuế TNCN: Lũy tiến 7 bậc (5%→35%)"],
    ["  Giảm trừ: 11tr/người + 4.4tr/người phụ thuộc"],
    ["  Net = Gross - 10.5% - Thuế TNCN"],
    ["  Tổng chi phí CĐ = Gross × 121.5%"],
    [""],
    ["VÍ DỤ: Gross 30,000,000đ (0 người phụ thuộc)"],
    ["  BHXH CĐ: 5,250,000đ | BHYT CĐ: 900,000đ | BHTN CĐ: 300,000đ"],
    ["  Tổng CĐ: 6,450,000đ → Chi phí công ty: 36,450,000đ"],
    ["  NLĐ khấu trừ: 3,150,000đ | Thuế TNCN ≈ 1,550,000đ"],
    ["  → Net ≈ 25,300,000đ"],
    [""],
    ["LƯU Ý:"],
    ["  • Import file này qua nút 'Import mẫu' trong Admin → Nhân sự Công ty"],
    ["  • Import file HR gốc ITSOL (Sổ QLHSNV) qua nút '📊 Import file HR'"],
    ["  • Upsert theo Mã NV — nếu mã đã tồn tại sẽ CẬP NHẬT, chưa có sẽ TẠO MỚI"],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(guide);
  ws2["!cols"] = [{ wch: 45 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Hướng dẫn");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="ITSOL-nhansu-import-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
