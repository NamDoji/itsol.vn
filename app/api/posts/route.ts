import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" }
  });
  return Response.json(posts);
}
