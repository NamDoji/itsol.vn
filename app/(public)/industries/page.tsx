import { ItsolSite } from "@/components/ItsolSite";
import { getLocale } from "@/lib/i18n";

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getLocale(searchParams);
  return <ItsolSite page="industries" initialLocale={locale} />;
}
