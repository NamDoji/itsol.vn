import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

type TalentRow = {
  // Original fields
  code?: unknown;
  role?: unknown;
  seniority?: unknown;
  skills?: unknown;
  yearsExperience?: unknown;
  englishLevel?: unknown;
  japaneseLevel?: unknown;
  grossSalary?: unknown;
  netSalary?: unknown;
  location?: unknown;
  workingModel?: unknown;
  availability?: unknown;
  summary?: unknown;
  // New personal info fields
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  department?: unknown;
  // New contract fields
  contractType?: unknown;
  contractStart?: unknown;
  contractEnd?: unknown;
  contractNumber?: unknown;
  // New salary/benefit fields
  socialInsurance?: unknown;
  healthInsurance?: unknown;
  otherAllowance?: unknown;
  totalCost?: unknown;
  // New billing fields
  billingRate?: unknown;
  billingRate2?: unknown;
  billingCurrency?: unknown;
};

function toStr(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  return String(v).trim();
}

function toFloat(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

function toInt(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseInt(String(v), 10);
  return isNaN(n) ? 0 : n;
}

function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  // Handle Excel serial date numbers
  if (typeof v === "number") {
    // Excel date serial -> JS Date
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  // Parse multipart form
  let file: File | null = null;
  try {
    const formData = await request.formData();
    file = formData.get("file") as File | null;
  } catch {
    return Response.json({ error: "Failed to parse form data" }, { status: 400 });
  }

  if (!file) {
    return Response.json({ error: "No file uploaded. Use field name 'file'." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["xlsx", "xls"].includes(ext ?? "")) {
    return Response.json({ error: "Only .xlsx and .xls files are accepted" }, { status: 400 });
  }

  // Read workbook
  let rows: TalentRow[];
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array", cellDates: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return Response.json({ error: "Excel file has no sheets" }, { status: 400 });
    }
    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json<TalentRow>(sheet, { defval: "" });
  } catch {
    return Response.json({ error: "Failed to parse Excel file" }, { status: 400 });
  }

  if (!rows.length) {
    return Response.json({ error: "Excel file is empty or has no data rows" }, { status: 400 });
  }

  let imported = 0;
  let updated = 0;
  const errors: { row: number; code: string; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header row
    const code = toStr(row.code);

    if (!code) {
      errors.push({ row: rowNum, code: "(empty)", message: "code is required" });
      continue;
    }

    const role = toStr(row.role);
    const seniority = toStr(row.seniority);
    const skills = toStr(row.skills);

    if (!role || !seniority || !skills) {
      errors.push({ row: rowNum, code, message: "role, seniority, and skills are required" });
      continue;
    }

    const data = {
      code,
      // Personal info
      fullName: toStr(row.fullName) || null,
      email: toStr(row.email) || null,
      phone: toStr(row.phone) || null,
      department: toStr(row.department) || null,
      // Professional
      role,
      seniority,
      skills,
      yearsExperience: toInt(row.yearsExperience),
      englishLevel: toStr(row.englishLevel, "N/A"),
      japaneseLevel: toStr(row.japaneseLevel, "N/A"),
      location: toStr(row.location, "Vietnam"),
      workingModel: toStr(row.workingModel, "Remote"),
      availability: toStr(row.availability, "Available"),
      summary: toStr(row.summary, `${role} with ${toInt(row.yearsExperience)} years of experience`),
      // Contract
      contractType: toStr(row.contractType) || null,
      contractStart: toDate(row.contractStart),
      contractEnd: toDate(row.contractEnd),
      contractNumber: toStr(row.contractNumber) || null,
      // Salary & benefits — billingRate maps to grossSalary column in template
      grossSalary: toFloat(row.grossSalary) ?? toFloat(row.billingRate),
      netSalary: toFloat(row.netSalary),
      socialInsurance: toFloat(row.socialInsurance),
      healthInsurance: toFloat(row.healthInsurance),
      otherAllowance: toFloat(row.otherAllowance),
      totalCost: toFloat(row.totalCost),
      // Billing
      billingRate2: toFloat(row.billingRate2),
      billingCurrency: toStr(row.billingCurrency, "VND"),
    };

    try {
      const existing = await prisma.talent.findUnique({ where: { code } });
      if (existing) {
        await prisma.talent.update({ where: { code }, data });
        updated++;
      } else {
        await prisma.talent.create({ data });
        imported++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push({ row: rowNum, code, message: msg });
    }
  }

  return Response.json({ imported, updated, errors }, { status: 200 });
}
