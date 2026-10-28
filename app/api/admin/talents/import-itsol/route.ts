/**
 * POST /api/admin/talents/import-itsol
 * Import nhân sự từ file "Sổ Quản Lý Hồ Sơ Nhân Sự" chuẩn ITSOL
 * Sheet: " THÔNG TIN NHÂN SỰ "
 * Data rows start at index 5 (rows 0-4 = headers + column numbers)
 */
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

function excelDateToDate(s: unknown): Date | null {
  if (!s || typeof s !== "number" || s < 1) return null;
  const d = new Date((s - 25569) * 86400 * 1000);
  return isNaN(d.getTime()) ? null : d;
}

function toStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function getLatestSalary(row: unknown[]): number | null {
  let latest: number | null = null;
  // Base salary at [52], then raises at [56],[60],[64],[68],[72],[76],[80]
  for (const idx of [52, 56, 60, 64, 68, 72, 76, 80]) {
    const v = row[idx];
    if (typeof v === "number" && v > 100000) latest = v;
  }
  return latest;
}

function mapContractType(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("không xác định") || s.includes("vô thời hạn")) return "fulltime";
  if (s.includes("thử việc")) return "probation";
  if (s.includes("xác định thời hạn")) return "parttime";
  if (s.includes("intern") || s.includes("thực tập")) return "intern";
  if (s.includes("freelance")) return "freelance";
  return "fulltime";
}

function mapStatus(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("đang làm") || s.includes("đang")) return "Available";
  return "Inactive";
}

function estimateSeniority(contractStart: Date | null): string {
  if (!contractStart) return "Mid";
  const years = (Date.now() - contractStart.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (years >= 8) return "Lead";
  if (years >= 4) return "Senior";
  if (years >= 2) return "Mid";
  return "Junior";
}

function cleanPhone(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).replace(/[^0-9+]/g, "");
  if (s.length < 9) return null;
  return s.length === 9 ? "0" + s : s;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  let file: File | null = null;
  try {
    const fd = await req.formData();
    file = fd.get("file") as File | null;
  } catch {
    return Response.json({ error: "Không thể đọc form data" }, { status: 400 });
  }
  if (!file) return Response.json({ error: "Cần gửi file (field: file)" }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) {
    return Response.json({ error: "File quá lớn (>20MB)" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buf, { type: "buffer" });
  } catch {
    return Response.json({ error: "Không thể đọc file Excel. Hãy đảm bảo file là .xlsx" }, { status: 422 });
  }

  // Find sheet
  const sheetName = wb.SheetNames.find(n =>
    n.includes("THÔNG TIN NHÂN SỰ") || n.includes("NHAN SU") ||
    n.trim().includes("THÔNG TIN")
  );
  if (!sheetName) {
    return Response.json({
      error: `Không tìm thấy sheet "THÔNG TIN NHÂN SỰ". File có các sheet: ${wb.SheetNames.join(", ")}`
    }, { status: 422 });
  }

  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" });

  // Validate format: row[1][2] should contain "Mã nhân viên"
  const headerRow = rows[1] as unknown[] | undefined;
  if (!headerRow || !String(headerRow[2]).includes("Mã nhân viên")) {
    return Response.json({
      error: "Định dạng file không đúng chuẩn ITSOL HR. Dùng file Sổ QLHSNV gốc."
    }, { status: 422 });
  }

  const results = { imported: 0, updated: 0, skipped: 0, errors: [] as string[] };

  for (let i = 5; i < rows.length; i++) {
    const row = rows[i] as unknown[];

    const code = toStr(row[2]);
    const fullName = toStr(row[3]);
    if (!code || code === "0" || !fullName) { results.skipped++; continue; }

    try {
      const statusRaw      = toStr(row[0]);
      const contractStart  = excelDateToDate(row[12]);
      const contractEnd    = excelDateToDate(row[34]);
      const dateOfBirth    = excelDateToDate(row[4]);
      const grossSalary    = getLatestSalary(row);
      const role           = toStr(row[91]) || "IT Staff";
      const department     = toStr(row[92]) || null;
      const contractTypeR  = toStr(row[33]);

      // Build address from fields
      const addr1 = toStr(row[17]);
      const addr2 = toStr(row[16]);
      const dist  = toStr(row[18]);
      const prov  = toStr(row[19]);
      const addressParts = [addr1 || addr2, dist, prov].filter(Boolean);
      const address = addressParts.join(", ") || null;

      const education = toStr(row[35]);
      const summary   = education
        ? `${fullName} — ${role}. Trình độ: ${education}`
        : `${fullName} — ${role} tại ITSOL`;

      const data = {
        fullName,
        email:          toStr(row[7])  || null,
        phone:          cleanPhone(row[6]),
        dateOfBirth,
        gender:         toStr(row[5]).toLowerCase() === "nam" ? "male" :
                        toStr(row[5]).toLowerCase() === "nữ"  ? "female" : null,
        idNumber:       toStr(row[13]) || null,
        address,
        role,
        department,
        seniority:      estimateSeniority(contractStart),
        yearsExperience: contractStart
          ? Math.max(0, Math.round((Date.now() - contractStart.getTime()) / (365.25 * 24 * 3600 * 1000)))
          : 0,
        englishLevel:   "B1",
        japaneseLevel:  "None",
        skills:         role,
        availability:   "Immediate",
        location:       "Hà Nội",
        workingModel:   "Onsite",
        summary,
        status:         mapStatus(statusRaw),
        contractType:   contractTypeR ? mapContractType(contractTypeR) : null,
        contractStart,
        contractEnd,
        grossSalary,
      };

      // Remove null values for optional fields only
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== null && v !== undefined)
      );

      const existing = await prisma.talent.findUnique({ where: { code } });
      if (existing) {
        await prisma.talent.update({ where: { code }, data: cleanData });
        results.updated++;
      } else {
        await prisma.talent.create({
          data: {
            code,
            role,
            seniority:      cleanData.seniority as string       || "Mid",
            skills:         cleanData.skills as string          || role,
            yearsExperience: cleanData.yearsExperience as number || 0,
            englishLevel:   cleanData.englishLevel as string    || "B1",
            japaneseLevel:  cleanData.japaneseLevel as string   || "None",
            availability:   cleanData.availability as string    || "Immediate",
            location:       cleanData.location as string        || "Hà Nội",
            workingModel:   cleanData.workingModel as string    || "Onsite",
            summary:        cleanData.summary as string         || summary,
            ...cleanData,
          },
        });
        results.imported++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Dòng ${i + 1} (${code}): ${msg.slice(0, 120)}`);
      if (results.errors.length >= 10) break;
    }
  }

  return Response.json({
    ok: results.errors.length === 0 || results.imported + results.updated > 0,
    sheet: sheetName.trim(),
    imported: results.imported,
    updated:  results.updated,
    skipped:  results.skipped,
    total:    results.imported + results.updated,
    errors:   results.errors,
    message:  results.errors.length > 0
      ? `Xong với ${results.errors.length} lỗi`
      : `Hoàn tất: ${results.imported} thêm mới, ${results.updated} cập nhật`,
  });
}
