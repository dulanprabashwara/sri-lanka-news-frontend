import { requestJson } from "@/lib/api/client";
import { ApiResponseError, parsePagedArticles } from "@/lib/api/parsers";
import type { ArticleCategory, DisplayLanguage, Language, TextSearchResponse } from "@/types/api";

export interface ArticleSearchOptions {
  query: string;
  page?: number;
  size?: number;
  source?: string;
  category?: ArticleCategory;
  language?: Language;
  displayLanguage?: DisplayLanguage;
}

export function parseTextSearchResponse(value: unknown): TextSearchResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiResponseError("Invalid search response.");
  }
  const data = value as Record<string, unknown>;
  if (typeof data.query !== "string" || data.query.trim() === "") {
    throw new ApiResponseError("Invalid search query response.");
  }
  return { ...parsePagedArticles(data), query: data.query };
}

export function searchArticles(options: ArticleSearchOptions) {
  const parameters = new URLSearchParams({
    q: options.query,
    page: String(options.page ?? 0),
    size: String(options.size ?? 20),
  });
  if (options.source) parameters.set("source", options.source);
  if (options.category) parameters.set("category", options.category);
  if (options.language) parameters.set("language", options.language);
  if (options.displayLanguage) parameters.set("displayLanguage", options.displayLanguage);
  return requestJson(`/api/v1/search/articles?${parameters}`, parseTextSearchResponse);
}
