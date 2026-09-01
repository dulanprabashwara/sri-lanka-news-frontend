import { requestJson } from "@/lib/api/client";
import {
  parseArticle,
  parseCoverageComparison,
  parsePagedArticles,
  parsePagedStories,
  parseSource,
  parseStoryDetail,
  parseStorySummary,
} from "@/lib/api/parsers";
import type {
  Article,
  ArticleCategory,
  CoverageComparison,
  Language,
  PagedResponse,
  Source,
  StoryDetail,
  StorySummary,
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

export interface StoryQuery {
  page?: number;
  size?: number;
  category?: ArticleCategory;
  publishedFrom?: string;
  publishedTo?: string;
  sort?: "lastPublishedAt,asc" | "lastPublishedAt,desc";
}

export function getStories(
  query: StoryQuery = {},
): Promise<PagedResponse<StorySummary>> {
  const parameters = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      parameters.set(key, String(value));
    }
  });
  const queryString = parameters.toString();
  return requestJson(
    `/api/v1/stories${queryString ? `?${queryString}` : ""}`,
    parsePagedStories,
  );
}

export function getStory(id: string): Promise<StoryDetail> {
  return requestJson(`/api/v1/stories/${encodeURIComponent(id)}`, parseStoryDetail);
}

export function getStoryCoverage(id: string): Promise<CoverageComparison> {
  return requestJson(
    `/api/v1/stories/${encodeURIComponent(id)}/coverage`,
    parseCoverageComparison,
  );
}

export function getArticleStory(articleId: string): Promise<StorySummary> {
  return requestJson(
    `/api/v1/articles/${encodeURIComponent(articleId)}/story`,
    parseStorySummary,
  );
}
