import { requestJson } from "@/lib/api/client";
import { ApiResponseError, parseArticle, parsePagedArticles } from "@/lib/api/parsers";
import type { ArticleCategory, DisplayLanguage, Language, SemanticSearchResponse, TextSearchResponse } from "@/types/api";

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

export function parseSemanticSearchResponse(value: unknown): SemanticSearchResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiResponseError("Invalid semantic search response.");
  }
  const data = value as Record<string, unknown>;
  if (typeof data.query !== "string" || data.query.trim() === "" ||
      !Array.isArray(data.content) || typeof data.page !== "number" ||
      typeof data.size !== "number" || typeof data.hasMore !== "boolean" ||
      typeof data.first !== "boolean") {
    throw new ApiResponseError("Invalid semantic search response.");
  }
  return {
    query: data.query,
    content: data.content.map(parseArticle),
    page: data.page,
    size: data.size,
    hasMore: data.hasMore,
    first: data.first,
  };
}

export function searchArticlesSemantically(options: ArticleSearchOptions) {
  const parameters = new URLSearchParams({
    q: options.query,
    page: String(options.page ?? 0),
    size: String(options.size ?? 20),
  });
  if (options.source) parameters.set("source", options.source);
  if (options.category) parameters.set("category", options.category);
  if (options.language) parameters.set("language", options.language);
  if (options.displayLanguage) parameters.set("displayLanguage", options.displayLanguage);
  return requestJson(`/api/v1/search/semantic?${parameters}`, parseSemanticSearchResponse);
}
