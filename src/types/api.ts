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

export interface ArticleLeadMedia {
  url: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "UNKNOWN";
  altText: string | null;
  caption: string | null;
  credit: string | null;
  width: number | null;
  height: number | null;
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
  leadMedia?: ArticleLeadMedia;
  localizedContent?: LocalizedContent;
}

export interface StoryRepresentativeMedia {
  url: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "UNKNOWN";
  altText: string | null;
  caption: string | null;
  credit: string | null;
  width: number | null;
  height: number | null;
  articleId: string;
  source: string;
}

export interface StorySummary {
  id: string;
  canonicalTitle: string;
  category: ArticleCategory | null;
  firstPublishedAt: string;
  lastPublishedAt: string;
  articleCount: number;
  sourceCount: number;
  representativeMedia?: StoryRepresentativeMedia;
  localizedContent?: LocalizedStoryContent;
}

export type TrendingReason =
  | "RECENTLY_UPDATED"
  | "MULTIPLE_SOURCES"
  | "MULTIPLE_REPORTS";

export interface TrendingStory extends StorySummary {
  reasons: TrendingReason[];
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
  analyticsEnabled: boolean;
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
  newArticleCount?: number | null;
}

export interface FollowBatchStatus {
  sources: Array<{
    slug: string;
    followed: boolean;
    followedAt: string | null;
  }>;
  topics: Array<{
    topic: string;
    followed: boolean;
    followedAt: string | null;
  }>;
}

export type RecommendationReasonType =
  | "FOLLOWED_SOURCE"
  | "FOLLOWED_TOPIC"
  | "PREFERRED_CATEGORY";

export interface RecommendationReason {
  type: RecommendationReasonType;
  label: string;
}

export interface ForYouItem {
  article: Article;
  personalized: boolean;
  reasons: RecommendationReason[];
}

export interface ForYouFeed extends PagedResponse<ForYouItem> {
  personalization: {
    personalized: boolean;
    signalCount: number;
  };
}

export interface TextSearchResponse extends PagedResponse<Article> {
  query: string;
}

export interface SemanticSearchResponse {
  query: string;
  content: Article[];
  page: number;
  size: number;
  hasMore: boolean;
  first: boolean;
}

export interface AskStoryCitation {
  number: number;
  articleId: string;
  title: string;
  source: {
    name: string;
    slug: string;
  };
  publishedAt: string;
  originalUrl: string;
}

export interface AskStoryResponse {
  storyId: string;
  answerable: boolean;
  answer: string;
  citations: AskStoryCitation[];
}

export type ProcessingStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "RETRYING";

export interface AdminArticle {
  articleId: string;
  title: string;
  source: { name: string; slug: string };
  processingStatus: ProcessingStatus;
  discoveredAt: string;
  publishedAt: string;
}

export interface AdminSource {
  id: string;
  name: string;
  slug: string;
  baseUrl: string;
  defaultLanguage: Language;
  ingestionType: "RSS" | "HTML";
  enabled: boolean;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOverview {
  sources: { total: number; enabled: number; paused: number; failing: number };
  articles: Record<
    "total" | "pending" | "processing" | "completed" | "retrying" | "failed",
    number
  >;
  stories: { total: number; createdRecently: number; recentActive: number };
  ingestion: {
    totalRuns: number;
    completedRuns: number;
    failedRuns: number;
    currentlyRunning: number;
    failingSources: number;
  };
  users: {
    totalProfiles: number;
    totalBookmarks: number;
    totalFollows: number;
  };
  recentFailures: AdminArticle[];
}

export interface AdminStory {
  id: string;
  displayTitle: string;
  category: string | null;
  articleCount: number;
  sourceCount: number;
  firstPublishedAt: string;
  lastPublishedAt: string;
  representativeMediaPresent: boolean;
  matchingVersion: string;
}

export interface AdminAuditEvent {
  id: string;
  adminUserId: string;
  eventType: string;
  targetSourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export type IngestionHealthStatus =
  | "HEALTHY"
  | "WARNING"
  | "STALE"
  | "FAILING"
  | "PAUSED"
  | "NEVER_RUN";

export interface AdminIngestionSource {
  sourceId: string;
  sourceSlug: string;
  displayName: string;
  language: Language;
  enabled: boolean;
  intervalMinutes: number;
  jitterSeconds: number;
  health: IngestionHealthStatus;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastRunStatus: string | null;
  lastRunId: string | null;
  lastDiscovered: number | null;
  lastSubmitted: number | null;
  lastSucceeded: number | null;
  lastFailed: number | null;
  consecutiveFailures: number;
}

export interface AdminRunHistoryResponse {
  runId: string;
  sourceSlug: string;
  triggerType: string;
  status: string;
  scheduledFor: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  articlesDiscovered: number | null;
  articlesSubmitted: number | null;
  articlesSucceeded: number | null;
  articlesFailed: number | null;
  safeErrorCode: string | null;
  safeErrorMessage: string | null;
}

export interface AdminAiModelProvider {
  id: string;
  name: string;
  pipeline: "ENRICHMENT" | "TRANSLATION" | "EMBEDDING" | "GROUNDED_QA" | string;
  role: "PRIMARY" | "FALLBACK" | string;
  model: string;
  configured: boolean;
  details: string;
}

export interface AdminAiOverviewResponse {
  enrichment: {
    completed: number;
    failed: number;
    retrying: number;
  };
  provider: {
    configured: boolean;
    providerName: string;
    modelName: string;
    embeddingModelName: string;
  };
  providers?: AdminAiModelProvider[];
}
