import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const companyName = String(formData.get("companyName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const file = formData.get("file") as File | null;

    if (!companyName) return Response.json({ error: "Company name is required" }, { status: 400 });
    if (!email) return Response.json({ error: "Email is required" }, { status: 400 });
    if (!file) return Response.json({ error: "File is required" }, { status: 400 });

    // Read file and encode as base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const originalFilename = file.name;

    await prisma.staffingRequest.create({
      data: {
        companyName,
        contactPerson: email, // use email as contact person reference
        email,
        phone: phone || "N/A",
        serviceModel: "Upload",
        numberOfTalents: 1,
        role: "To be determined",
        seniority: "To be determined",
        technologyStack: "See attached file",
        jobDescription: `[FILE]${base64}`,
        notes: originalFilename,
        status: "New",
      },
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[staffing/upload]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
