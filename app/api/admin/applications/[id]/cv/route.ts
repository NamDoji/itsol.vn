import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const app = await prisma.jobApplication.findUnique({ where: { id: Number(id) }, select: { cvUrl: true, message: true } });
  if (!app?.cvUrl) return Response.json({ error: "No CV found" }, { status: 404 });

  if (app.cvUrl.startsWith("data:filename=")) {
    // Format: data:filename=<name>;base64,<data>
    const [meta, data] = app.cvUrl.split(";base64,");
    const filename = meta.replace("data:filename=", "") || "cv.pdf";
    const buffer = Buffer.from(data, "base64");
    const ext = filename.split(".").pop()?.toLowerCase() ?? "pdf";
    const mimeMap: Record<string, string> = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
    const mime = mimeMap[ext] ?? "application/octet-stream";
    return new Response(buffer, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Plain URL
  return Response.redirect(app.cvUrl);
}
