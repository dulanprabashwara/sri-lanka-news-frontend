export const ARTICLE_CATEGORIES = [
  "POLITICS",
  "BUSINESS",
  "SPORTS",
  "ENTERTAINMENT",
  "TECHNOLOGY",
  "HEALTH",
  "SCIENCE",
  "WORLD",
  "LOCAL",
  "OTHER",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export type Language = "en" | "si" | "ta";

export interface SourceSummary {
  name: string;
  slug: string;
  baseUrl: string;
}

export interface Source extends SourceSummary {
  defaultLanguage: Language;
}

export interface Article {
  id: string;
  title: string;
  originalUrl: string;
  originalLanguage: Language;
  authors: string[];
  publishedAt: string;
  discoveredAt: string;
  category: ArticleCategory | null;
  source: SourceSummary;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
