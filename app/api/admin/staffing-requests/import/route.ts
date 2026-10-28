/**
 * POST /api/admin/staffing-requests/import
 * Import staffing requests from .xlsx file.
 * Upsert by email — existing email rows are skipped.
 * Returns { imported, skipped, errors }
 */
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

type StaffingRow = {
  clientName?: unknown;
  email?: unknown;
  phone?: unknown;
  service?: unknown;
  roles?: unknown;
  timeline?: unknown;
  budget?: unknown;
  message?: unknown;
};

function toStr(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  return String(v).trim();
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
  let rows: StaffingRow[];
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array", cellDates: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return Response.json({ error: "Excel file has no sheets" }, { status: 400 });
    }
    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json<StaffingRow>(sheet, { defval: "" });
  } catch {
    return Response.json({ error: "Failed to parse Excel file" }, { status: 400 });
  }

  if (!rows.length) {
    return Response.json({ error: "Excel file is empty or has no data rows" }, { status: 400 });
  }

  let imported = 0;
  let skipped = 0;
  const errors: { row: number; email: string; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header row

    const clientName = toStr(row.clientName);
    const email      = toStr(row.email);

    if (!email) {
      errors.push({ row: rowNum, email: "(empty)", message: "email is required" });
      continue;
    }

    if (!clientName) {
      errors.push({ row: rowNum, email, message: "clientName is required" });
      continue;
    }

    try {
      // Upsert by email: skip if already exists
      const existing = await prisma.staffingRequest.findFirst({ where: { email } });
      if (existing) {
        skipped++;
        continue;
      }

      await prisma.staffingRequest.create({
        data: {
          companyName:     clientName,
          contactPerson:   clientName,
          email,
          phone:           toStr(row.phone),
          serviceModel:    toStr(row.service),
          numberOfTalents: 1,
          role:            toStr(row.roles),
          seniority:       "Mid",
          technologyStack: "",
          duration:        toStr(row.timeline) || null,
          budgetRange:     toStr(row.budget)   || null,
          notes:           toStr(row.message)  || null,
        },
      });
      imported++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push({ row: rowNum, email, message: msg });
    }
  }

  return Response.json({ imported, skipped, errors }, { status: 200 });
}
