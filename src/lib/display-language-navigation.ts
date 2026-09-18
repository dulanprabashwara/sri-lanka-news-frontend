import type { DisplayLanguage } from "@/types/api";

export type DisplayLanguageSelection = "original" | DisplayLanguage;

export function buildDisplayLanguagePath(
  currentPath: string,
  language: DisplayLanguageSelection,
): string {
  const url = new URL(currentPath, "https://ceylon-news.local");
  if (language === "original") url.searchParams.delete("lang");
  else url.searchParams.set("lang", language);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function navigateToDisplayLanguage(
  location: Pick<Location, "assign">,
  currentPath: string,
  language: DisplayLanguageSelection,
) {
  location.assign(buildDisplayLanguagePath(currentPath, language));
}
