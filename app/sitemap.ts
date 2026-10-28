import type { MetadataRoute } from "next";
import { getPublicSiteData } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const data = await getPublicSiteData();
  const staticPaths = [
    "",
    "/about",
    "/industries",
    "/case-studies",
    "/products-ai-ecosystem",
    "/careers",
    "/blog",
    "/contact",
    "/it-staffing"
  ];

  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, lastModified: new Date() })),
    ...data.services.map((service) => ({ url: `${base}/services/${service.slug}`, lastModified: new Date() }))
  ];
}
