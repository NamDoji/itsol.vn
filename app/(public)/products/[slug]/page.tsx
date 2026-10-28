import { ItsolSite } from "@/components/ItsolSite";
import { products } from "@/data/site";
import { getLocale } from "@/lib/i18n";

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, locale] = await Promise.all([params, getLocale(searchParams)]);
  return <ItsolSite page="product-detail" initialLocale={locale} initialProductSlug={slug} />;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}
