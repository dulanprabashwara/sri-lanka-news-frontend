import { requestJson } from "@/lib/api/client";
import {
  ApiResponseError,
  parseArticle,
  parseCoverageComparison,
  parsePagedArticles,
  parsePagedStories,
  parseSource,
  parseStoryDetail,
  parseStorySummary,
  parseStoryTimeline,
  parseAskStoryResponse,
  parseTrendingArticles,
  parseTrendingStories,
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
  StoryTimeline,
  AskStoryResponse,
  TrendingStory,
} from "@/types/api";

export interface ArticleQuery {
  page?: number;
  size?: number;
  source?: string;
  category?: ArticleCategory;
  language?: Language;
  displayLanguage?: Language;
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

export function getArticle(
  id: string,
  displayLanguage?: Language,
): Promise<Article> {
  const query = displayLanguage ? `?displayLanguage=${displayLanguage}` : "";
  return requestJson(
    `/api/v1/articles/${encodeURIComponent(id)}${query}`,
    parseArticle,
  );
}

export function getSource(slug: string): Promise<Source> {
  return requestJson(
    `/api/v1/sources/${encodeURIComponent(slug)}`,
    parseSource,
  );
}

export function getSources(): Promise<Source[]> {
  return requestJson("/api/v1/sources", (value: unknown) => {
    if (!Array.isArray(value))
      throw new ApiResponseError("Invalid source list.");
    return value.map(parseSource);
  });
}

export interface StoryQuery {
  page?: number;
  size?: number;
  category?: ArticleCategory;
  publishedFrom?: string;
  publishedTo?: string;
  sort?: "lastPublishedAt,asc" | "lastPublishedAt,desc";
  displayLanguage?: Language;
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

export interface TrendingQuery {
  limit?: number;
  category?: ArticleCategory;
  displayLanguage?: Language;
}

export function getTrendingStories(
  query: TrendingQuery = {},
): Promise<TrendingStory[]> {
  const parameters = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) parameters.set(key, String(value));
  });
  const queryString = parameters.toString();
  return requestJson(
    `/api/v1/stories/trending${queryString ? `?${queryString}` : ""}`,
    parseTrendingStories,
  );
}

export function getTrendingArticles(
  query: TrendingQuery = {},
): Promise<Article[]> {
  const parameters = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) parameters.set(key, String(value));
  });
  const queryString = parameters.toString();
  return requestJson(
    `/api/v1/trending/articles${queryString ? `?${queryString}` : ""}`,
    parseTrendingArticles,
  );
}

export function getStory(
  id: string,
  displayLanguage?: Language,
): Promise<StoryDetail> {
  const query = displayLanguage ? `?displayLanguage=${displayLanguage}` : "";
  return requestJson(
    `/api/v1/stories/${encodeURIComponent(id)}${query}`,
    parseStoryDetail,
  );
}

export function getStoryCoverage(
  id: string,
  displayLanguage?: Language,
): Promise<CoverageComparison> {
  const query = displayLanguage ? `?displayLanguage=${displayLanguage}` : "";
  return requestJson(
    `/api/v1/stories/${encodeURIComponent(id)}/coverage${query}`,
    parseCoverageComparison,
  );
}

export function getStoryTimeline(
  id: string,
  displayLanguage?: Language,
): Promise<StoryTimeline> {
  const query = displayLanguage ? `?displayLanguage=${displayLanguage}` : "";
  return requestJson(
    `/api/v1/stories/${encodeURIComponent(id)}/timeline${query}`,
    parseStoryTimeline,
  );
}

export function getArticleStory(
  articleId: string,
  displayLanguage?: Language,
): Promise<StorySummary> {
  const query = displayLanguage ? `?displayLanguage=${displayLanguage}` : "";
  return requestJson(
    `/api/v1/articles/${encodeURIComponent(articleId)}/story${query}`,
    parseStorySummary,
  );
}

export function askStory(
  storyId: string,
  question: string,
  displayLanguage?: Language,
): Promise<AskStoryResponse> {
  return requestJson(
    `/api/v1/stories/${encodeURIComponent(storyId)}/ask`,
    parseAskStoryResponse,
    {
      method: "POST",
      body: {
        question,
        ...(displayLanguage ? { displayLanguage } : {}),
      },
    },
  );
}
