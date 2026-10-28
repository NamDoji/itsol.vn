import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ─── PATCH /api/timesheets/:id ─────────────────────────────────────
// Updates timesheet status to "Submitted" (only allowed from "Draft")
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const timesheetId = parseInt(id, 10);
  if (isNaN(timesheetId)) {
    return Response.json({ error: "Invalid timesheet ID" }, { status: 400 });
  }

  const timesheet = await prisma.timesheet.findUnique({
    where: { id: timesheetId },
    select: { id: true, status: true },
  });

  if (!timesheet) {
    return Response.json({ error: "Timesheet not found" }, { status: 404 });
  }

  if (timesheet.status !== "Draft") {
    return Response.json(
      { error: `Cannot submit timesheet with status "${timesheet.status}". Only Draft timesheets can be submitted.` },
      { status: 409 }
    );
  }

  const updated = await prisma.timesheet.update({
    where: { id: timesheetId },
    data: { status: "Submitted" },
  });

  return Response.json(updated);
}
