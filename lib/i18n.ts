export type Locale = "vi" | "en";

type SearchParams = Record<string, string | string[] | undefined>;

export async function getLocale(searchParams?: SearchParams | Promise<SearchParams>): Promise<Locale> {
  const resolved = searchParams ? await searchParams : undefined;
  const raw = Array.isArray(resolved?.lang) ? resolved?.lang[0] : resolved?.lang;
  return raw === "en" ? "en" : "vi";
}

export function localize<T>(locale: Locale, vi: T, en: T) {
  return locale === "vi" ? vi : en;
}
