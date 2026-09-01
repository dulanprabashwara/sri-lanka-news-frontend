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
  summary: string | null;
  topics: string[];
  source: SourceSummary;
}

export interface StorySummary {
  id: string;
  canonicalTitle: string;
  category: ArticleCategory | null;
  firstPublishedAt: string;
  lastPublishedAt: string;
  articleCount: number;
  sourceCount: number;
}

export interface StoryDetail extends StorySummary {
  articles: Article[];
}

export interface CoverageEntity {
  name: string;
  type: string;
}

export interface CoverageArticle {
  id: string;
  title: string;
  summary: string | null;
  originalLanguage: Language;
  publishedAt: string;
  originalUrl: string;
}

export interface CoverageSource {
  name: string;
  slug: string;
}

export interface SourceCoverage {
  source: CoverageSource;
  reportCount: number;
  languages: Language[];
  firstPublishedAt: string;
  lastPublishedAt: string;
  articles: CoverageArticle[];
  topics: string[];
  uniqueTopics: string[];
  entities: CoverageEntity[];
  uniqueEntities: CoverageEntity[];
}

export interface CoverageComparison {
  storyId: string;
  canonicalTitle: string;
  articleCount: number;
  sourceCount: number;
  comparisonAvailable: boolean;
  sharedTopics: string[];
  sharedEntities: CoverageEntity[];
  sources: SourceCoverage[];
}

export interface TimelineSource {
  name: string;
  slug: string;
}

export interface TimelineEvent {
  articleId: string;
  title: string;
  summary: string | null;
  originalLanguage: Language;
  publishedAt: string;
  originalUrl: string;
  source: TimelineSource;
  minutesFromFirstReport: number;
}

export interface StoryTimeline {
  storyId: string;
  canonicalTitle: string;
  firstPublishedAt: string;
  lastPublishedAt: string;
  eventCount: number;
  sourceCount: number;
  events: TimelineEvent[];
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
