import { withDisplayLanguage } from "@/lib/language";
import type { ArticleCategory, DisplayLanguage, Language } from "@/types/api";

export type SearchMode = "text" | "semantic";

export function readSearchMode(value: string | undefined): SearchMode {
  return value === "semantic" ? "semantic" : "text";
}

export function buildSearchHref(options: {
  query: string;
  mode: SearchMode;
  page?: number;
  source?: string;
  category?: ArticleCategory;
  language?: Language;
  displayLanguage?: DisplayLanguage;
}) {
  const parameters = new URLSearchParams();
  if (options.query) parameters.set("q", options.query);
  parameters.set("mode", options.mode);
  if (options.page && options.page > 0) parameters.set("page", String(options.page));
  if (options.source) parameters.set("source", options.source);
  if (options.category) parameters.set("category", options.category);
  if (options.language) parameters.set("language", options.language);
  return withDisplayLanguage(`/search?${parameters}`, options.displayLanguage);
}
