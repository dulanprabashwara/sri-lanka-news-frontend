import { requestJson } from "@/lib/api/client";
import {
  parseArticle,
  parsePagedArticles,
  parseSource,
} from "@/lib/api/parsers";
import type {
  Article,
  ArticleCategory,
  Language,
  PagedResponse,
  Source,
} from "@/types/api";

export interface ArticleQuery {
  page?: number;
  size?: number;
  source?: string;
  category?: ArticleCategory;
  language?: Language;
  sort?: "publishedAt,asc" | "publishedAt,desc";
}

export function getArticles(
  query: ArticleQuery = {},
): Promise<PagedResponse<Article>> {
  const parameters = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      parameters.set(key, String(value));
    }
  });
  const queryString = parameters.toString();
  return requestJson(
    `/api/v1/articles${queryString ? `?${queryString}` : ""}`,
    parsePagedArticles,
  );
}

export function getArticle(id: string): Promise<Article> {
  return requestJson(`/api/v1/articles/${encodeURIComponent(id)}`, parseArticle);
}

export function getSource(slug: string): Promise<Source> {
  return requestJson(`/api/v1/sources/${encodeURIComponent(slug)}`, parseSource);
}
