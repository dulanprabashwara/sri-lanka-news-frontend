import { getStoryCoverage } from "@/lib/api/news";
import type { CoverageComparison } from "@/types/api";
import type { DisplayLanguage } from "@/types/api";

export async function getOptionalStoryCoverage(
  storyId: string,
  displayLanguageOrLoader?: DisplayLanguage | ((id: string, language?: DisplayLanguage) => Promise<CoverageComparison>),
  loader: (id: string, language?: DisplayLanguage) => Promise<CoverageComparison> = getStoryCoverage,
): Promise<CoverageComparison | null> {
  const displayLanguage = typeof displayLanguageOrLoader === "function" ? undefined : displayLanguageOrLoader;
  const resolvedLoader = typeof displayLanguageOrLoader === "function" ? displayLanguageOrLoader : loader;
  try {
    return await resolvedLoader(storyId, displayLanguage);
  } catch {
    return null;
  }
}
