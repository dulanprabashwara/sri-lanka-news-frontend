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
export type DisplayLanguage = Language;

export interface LocalizedContent {
  requestedLanguage: Language;
  resolvedLanguage: Language;
  translated: boolean;
  fallback: boolean;
  title: string;
  summary: string | null;
}

export interface LocalizedStoryContent {
  requestedLanguage: Language;
  resolvedLanguage: Language;
  translated: boolean;
  fallback: boolean;
  title: string;
}

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
  localizedContent?: LocalizedContent;
}

export interface StorySummary {
  id: string;
  canonicalTitle: string;
  category: ArticleCategory | null;
  firstPublishedAt: string;
  lastPublishedAt: string;
  articleCount: number;
  sourceCount: number;
  localizedContent?: LocalizedStoryContent;
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
  localizedContent?: LocalizedContent;
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
  localizedContent?: LocalizedStoryContent;
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
  localizedContent?: LocalizedContent;
}

export interface StoryTimeline {
  storyId: string;
  canonicalTitle: string;
  firstPublishedAt: string;
  lastPublishedAt: string;
  eventCount: number;
  sourceCount: number;
  events: TimelineEvent[];
  localizedContent?: LocalizedStoryContent;
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

export type PreferredDisplayLanguage = "ORIGINAL" | "EN" | "SI" | "TA";

export interface UserPreferences {
  preferredDisplayLanguage: PreferredDisplayLanguage;
  preferredCategories: ArticleCategory[];
  createdAt: string | null;
  updatedAt: string | null;
}

export type BookmarkTargetType = "ARTICLE" | "STORY";

export interface BookmarkStatus {
  bookmarked: boolean;
  createdAt: string | null;
}

export interface Bookmark {
  bookmarkId: string;
  targetType: BookmarkTargetType;
  targetId: string;
  createdAt: string;
  article: Article | null;
  story: StorySummary | null;
}

export type FollowTargetType = "SOURCE" | "TOPIC";

export interface FollowStatus {
  followed: boolean;
  followedAt: string | null;
}

export interface Follow {
  followId: string;
  targetType: FollowTargetType;
  createdAt: string;
  source: SourceSummary | null;
  topic: { label: string } | null;
}

export interface FollowBatchStatus {
  sources: Array<{ slug: string; followed: boolean; followedAt: string | null }>;
  topics: Array<{ topic: string; followed: boolean; followedAt: string | null }>;
}
