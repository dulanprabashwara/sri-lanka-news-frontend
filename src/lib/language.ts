import type {
  Article,
  DisplayLanguage,
  Language,
  LocalizedContent,
  StorySummary,
} from "@/types/api";

export function readDisplayLanguage(
  value: string | string[] | undefined | null,
): DisplayLanguage | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "en" || candidate === "si" || candidate === "ta"
    ? candidate
    : undefined;
}

export function withDisplayLanguage(
  path: string,
  displayLanguage?: DisplayLanguage,
): string {
  if (!displayLanguage) return path;
  const [pathname, query = ""] = path.split("?", 2);
  const parameters = new URLSearchParams(query);
  parameters.set("lang", displayLanguage);
  return `${pathname}?${parameters.toString()}`;
}

export function articleContent(article: Article): {
  title: string;
  summary: string | null;
  localization?: LocalizedContent;
} {
  return article.localizedContent
    ? {
        title: article.localizedContent.title,
        summary: article.localizedContent.summary,
        localization: article.localizedContent,
      }
    : { title: article.title, summary: article.summary };
}

export function storyTitle(story: StorySummary): string {
  return story.localizedContent?.title ?? story.canonicalTitle;
}

export function translationLabel(
  localization: LocalizedContent | undefined,
  originalLanguage: Language,
): string | null {
  if (!localization?.translated) return null;
  return `Translated from ${languageName(originalLanguage)}`;
}

export function languageName(language: Language): string {
  if (language === "si") return "Sinhala";
  if (language === "ta") return "Tamil";
  return "English";
}
