import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const jobs = await prisma.job.findMany({
    where: { published: true },
    select: { id: true, title: true, department: true, location: true, level: true, headcount: true, description: true, requirements: true, benefits: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ jobs });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name     = String(formData.get("name")     ?? "").trim();
    const email    = String(formData.get("email")    ?? "").trim();
    const phone    = String(formData.get("phone")    ?? "").trim();
    const position = String(formData.get("position") ?? "").trim();
    const cvLink   = String(formData.get("cv_link")  ?? "").trim();
    const coverMsg = String(formData.get("message")  ?? "").trim();
    const file     = formData.get("file") as File | null;

    if (!name)     return Response.json({ error: "Họ tên là bắt buộc" }, { status: 400 });
    if (!email)    return Response.json({ error: "Email là bắt buộc" },  { status: 400 });
    if (!position) return Response.json({ error: "Vị trí ứng tuyển là bắt buộc" }, { status: 400 });

    // Must provide at least file or link
    if (!file && !cvLink) {
      return Response.json({ error: "Vui lòng upload CV hoặc cung cấp link Google Drive / Dropbox" }, { status: 400 });
    }

    let cvUrl: string | null = cvLink || null;

    if (file && file.size > 0) {
      // Store base64 only for files ≤ 4MB (safe for Vercel + Postgres)
      if (file.size > 4 * 1024 * 1024) {
        return Response.json({
          error: `File CV (${(file.size / 1024 / 1024).toFixed(1)}MB) vượt quá 4MB. Vui lòng dùng link Google Drive hoặc nén file lại.`
        }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      cvUrl = `data:filename=${file.name};base64,${base64}`;
    }

    const messageLog = [
      file ? `File: ${file.name} (${file ? Math.round(file.size / 1024) : 0}KB)` : "",
      cvLink ? `Link CV: ${cvLink}` : "",
      coverMsg ? `Giới thiệu: ${coverMsg}` : "",
    ].filter(Boolean).join("\n");

    await prisma.jobApplication.create({
      data: {
        name,
        email,
        phone: phone || null,
        position,
        cvUrl,
        message: messageLog || null,
        status: "new",
      },
    });

    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[careers/apply]", msg);
    // Return specific DB/Prisma error to help debugging
    return Response.json(
      { error: `Lỗi hệ thống. Vui lòng gửi CV tới careers@itsol.vn (chi tiết: ${msg.slice(0, 120)})` },
      { status: 500 }
    );
  }
}
