import { getLocale } from "@/lib/i18n";
import TimesheetsPortal from "./TimesheetsPortal";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale(searchParams);
  return <TimesheetsPortal initialLocale={locale} />;
}
