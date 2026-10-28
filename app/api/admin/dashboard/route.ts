import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const [
    contacts,
    staffingRequests,
    talents,
    availableTalents,
    applications,
    posts,
    productInquiries,
    timesheets,
    contentBlocks,
    jobs,
    newsletter
  ] = await Promise.all([
    prisma.contactRequest.count(),
    prisma.staffingRequest.count(),
    prisma.talent.count(),
    prisma.talent.count({ where: { status: "Available" } }),
    prisma.jobApplication.count(),
    prisma.blogPost.count(),
    prisma.productInquiry.count(),
    prisma.timesheet.count(),
    prisma.contentBlock.count(),
    prisma.job.count(),
    prisma.newsletterSubscriber.count()
  ]);

  return Response.json({
    contacts,
    staffingRequests,
    talents,
    availableTalents,
    applications,
    posts,
    productInquiries,
    timesheets,
    contentBlocks,
    jobs,
    newsletter
  });
}
