import { ItsolSite } from "@/components/ItsolSite";
import type { PageKey } from "@/components/ItsolSite";
import { getLocale } from "@/lib/i18n";

const slugToPage: Record<string, PageKey> = {
  staffing: "staffing",
  "software-outsourcing": "software-outsourcing",
  odc: "odc",
  "product-development": "product-development"
};

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, locale] = await Promise.all([params, getLocale(searchParams)]);
  const page: PageKey = slugToPage[slug] ?? "services";
  return <ItsolSite page={page} initialLocale={locale} />;
}

export async function generateStaticParams() {
  return Object.keys(slugToPage).map(slug => ({ slug }));
}
