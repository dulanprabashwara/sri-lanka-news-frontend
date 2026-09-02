import {
  ARTICLE_CATEGORIES,
  type Article,
  type ArticleCategory,
  type CoverageArticle,
  type CoverageComparison,
  type CoverageEntity,
  type CoverageSource,
  type Language,
  type LocalizedContent,
  type LocalizedStoryContent,
  type PagedResponse,
  type Source,
  type SourceSummary,
  type StoryDetail,
  type StorySummary,
  type StoryTimeline,
  type SourceCoverage,
  type TimelineEvent,
  type TimelineSource,
  type AskStoryResponse,
  type AskStoryCitation,
} from "@/types/api";

export class ApiResponseError extends Error {
  constructor(message = "The backend returned an unexpected response.") {
    super(message);
    this.name = "ApiResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiResponseError(`Invalid ${field} in API response.`);
  }
  return value;
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiResponseError(`Invalid ${field} in API response.`);
  }
  return value;
}

function requireBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new ApiResponseError(`Invalid ${field} in API response.`);
  }
  return value;
}

function optionalString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return requireString(value, field);
}

function parseStrings(value: unknown, field: string): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new ApiResponseError(`Invalid ${field} in API response.`);
  }
  return value.map((item) => requireString(item, field));
}

function requireHttpUrl(value: unknown, field: string): string {
  const candidate = requireString(value, field);
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }
    return candidate;
  } catch {
    throw new ApiResponseError(`Invalid ${field} in API response.`);
  }
}

function requireDate(value: unknown, field: string): string {
  const candidate = requireString(value, field);
  if (Number.isNaN(Date.parse(candidate))) {
    throw new ApiResponseError(`Invalid ${field} in API response.`);
  }
  return candidate;
}

function parseLanguage(value: unknown): Language {
  if (value === "en" || value === "si" || value === "ta") {
    return value;
  }
  throw new ApiResponseError("Invalid language in API response.");
}

function parseLocalizedContent(value: unknown): LocalizedContent | undefined {
  if (value === null || value === undefined) return undefined;
  if (!isRecord(value)) throw new ApiResponseError("Invalid localized content.");
  return {
    requestedLanguage: parseLanguage(value.requestedLanguage),
    resolvedLanguage: parseLanguage(value.resolvedLanguage),
    translated: requireBoolean(value.translated, "localized translated indicator"),
    fallback: requireBoolean(value.fallback, "localized fallback indicator"),
    title: requireString(value.title, "localized title"),
    summary: optionalString(value.summary, "localized summary"),
  };
}

function parseLocalizedStoryContent(
  value: unknown,
): LocalizedStoryContent | undefined {
  if (value === null || value === undefined) return undefined;
  if (!isRecord(value)) throw new ApiResponseError("Invalid localized Story content.");
  return {
    requestedLanguage: parseLanguage(value.requestedLanguage),
    resolvedLanguage: parseLanguage(value.resolvedLanguage),
    translated: requireBoolean(value.translated, "localized Story translated indicator"),
    fallback: requireBoolean(value.fallback, "localized Story fallback indicator"),
    title: requireString(value.title, "localized Story title"),
  };
}

function parseCategory(value: unknown): ArticleCategory | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (
    typeof value === "string" &&
    ARTICLE_CATEGORIES.includes(value as ArticleCategory)
  ) {
    return value as ArticleCategory;
  }
  throw new ApiResponseError("Invalid category in API response.");
}

function parseSourceSummary(value: unknown): SourceSummary {
  if (!isRecord(value)) {
    throw new ApiResponseError("Invalid source in API response.");
  }
  return {
    name: requireString(value.name, "source name"),
    slug: requireString(value.slug, "source slug"),
    baseUrl: requireHttpUrl(value.baseUrl, "source URL"),
  };
}

function parseCoverageEntity(value: unknown): CoverageEntity {
  if (!isRecord(value)) {
    throw new ApiResponseError("Invalid coverage entity in API response.");
  }
  return {
    name: requireString(value.name, "coverage entity name"),
    type: requireString(value.type, "coverage entity type"),
  };
}

function parseCoverageSource(value: unknown): CoverageSource {
  if (!isRecord(value)) {
    throw new ApiResponseError("Invalid coverage source in API response.");
  }
  return {
    name: requireString(value.name, "coverage source name"),
    slug: requireString(value.slug, "coverage source slug"),
  };
}

function parseCoverageArticle(value: unknown): CoverageArticle {
  if (!isRecord(value)) {
    throw new ApiResponseError("Invalid coverage article in API response.");
  }
  const localizedContent = parseLocalizedContent(value.localizedContent);
  return {
    id: requireString(value.id, "coverage article ID"),
    title: requireString(value.title, "coverage article title"),
    summary: optionalString(value.summary, "coverage article summary"),
    originalLanguage: parseLanguage(value.originalLanguage),
    publishedAt: requireDate(value.publishedAt, "coverage publication date"),
    originalUrl: requireHttpUrl(value.originalUrl, "coverage original URL"),
    ...(localizedContent ? { localizedContent } : {}),
  };
}

function parseTimelineSource(value: unknown): TimelineSource {
  if (!isRecord(value)) {
    throw new ApiResponseError("Invalid timeline source in API response.");
  }
  return {
    name: requireString(value.name, "timeline source name"),
    slug: requireString(value.slug, "timeline source slug"),
  };
}

function parseTimelineEvent(value: unknown): TimelineEvent {
  if (!isRecord(value)) {
    throw new ApiResponseError("Invalid timeline event in API response.");
  }
  const localizedContent = parseLocalizedContent(value.localizedContent);
  return {
    articleId: requireString(value.articleId, "timeline article ID"),
    title: requireString(value.title, "timeline article title"),
    summary: optionalString(value.summary, "timeline article summary"),
    originalLanguage: parseLanguage(value.originalLanguage),
    publishedAt: requireDate(value.publishedAt, "timeline publication date"),
    originalUrl: requireHttpUrl(value.originalUrl, "timeline original URL"),
    source: parseTimelineSource(value.source),
    minutesFromFirstReport: requireNumber(
      value.minutesFromFirstReport,
      "timeline relative minutes",
    ),
    ...(localizedContent ? { localizedContent } : {}),
  };
}

function parseSourceCoverage(value: unknown): SourceCoverage {
  if (!isRecord(value) || !Array.isArray(value.languages) ||
      !Array.isArray(value.articles) || !Array.isArray(value.entities) ||
      !Array.isArray(value.uniqueEntities)) {
    throw new ApiResponseError("Invalid source coverage in API response.");
  }
  return {
    source: parseCoverageSource(value.source),
    reportCount: requireNumber(value.reportCount, "coverage report count"),
    languages: value.languages.map(parseLanguage),
    firstPublishedAt: requireDate(value.firstPublishedAt, "coverage first publication date"),
    lastPublishedAt: requireDate(value.lastPublishedAt, "coverage latest publication date"),
    articles: value.articles.map(parseCoverageArticle),
    topics: parseStrings(value.topics, "coverage topic"),
    uniqueTopics: parseStrings(value.uniqueTopics, "source-specific topic"),
    entities: value.entities.map(parseCoverageEntity),
    uniqueEntities: value.uniqueEntities.map(parseCoverageEntity),
  };
}

export function parseSource(value: unknown): Source {
  if (!isRecord(value)) {
    throw new ApiResponseError("Invalid source response.");
  }
  return {
    ...parseSourceSummary(value),
    defaultLanguage: parseLanguage(value.defaultLanguage),
  };
}

export function parseArticle(value: unknown): Article {
  if (!isRecord(value) || !Array.isArray(value.authors)) {
    throw new ApiResponseError("Invalid article response.");
  }
  const localizedContent = parseLocalizedContent(value.localizedContent);
  return {
    id: requireString(value.id, "article ID"),
    title: requireString(value.title, "article title"),
    originalUrl: requireHttpUrl(value.originalUrl, "original article URL"),
    originalLanguage: parseLanguage(value.originalLanguage),
    authors: value.authors.map((author) => requireString(author, "author")),
    publishedAt: requireDate(value.publishedAt, "publication date"),
    discoveredAt: requireDate(value.discoveredAt, "discovery date"),
    category: parseCategory(value.category),
    summary: optionalString(value.summary, "article summary"),
    topics: parseStrings(value.topics, "article topic"),
    source: parseSourceSummary(value.source),
    ...(localizedContent ? { localizedContent } : {}),
  };
}

export function parseStorySummary(value: unknown): StorySummary {
  if (!isRecord(value)) {
    throw new ApiResponseError("Invalid story response.");
  }
  const localizedContent = parseLocalizedStoryContent(value.localizedContent);
  return {
    id: requireString(value.id, "story ID"),
    canonicalTitle: requireString(value.canonicalTitle, "story title"),
    category: parseCategory(value.category),
    firstPublishedAt: requireDate(value.firstPublishedAt, "first publication date"),
    lastPublishedAt: requireDate(value.lastPublishedAt, "latest publication date"),
    articleCount: requireNumber(value.articleCount, "article count"),
    sourceCount: requireNumber(value.sourceCount, "source count"),
    ...(localizedContent ? { localizedContent } : {}),
  };
}

export function parseStoryDetail(value: unknown): StoryDetail {
  if (!isRecord(value) || !Array.isArray(value.articles)) {
    throw new ApiResponseError("Invalid story detail response.");
  }
  return {
    ...parseStorySummary(value),
    articles: value.articles.map(parseArticle),
  };
}

export function parseCoverageComparison(value: unknown): CoverageComparison {
  if (!isRecord(value) || !Array.isArray(value.sharedEntities) ||
      !Array.isArray(value.sources)) {
    throw new ApiResponseError("Invalid coverage comparison response.");
  }
  const localizedContent = parseLocalizedStoryContent(value.localizedContent);
  return {
    storyId: requireString(value.storyId, "coverage story ID"),
    canonicalTitle: requireString(value.canonicalTitle, "coverage story title"),
    articleCount: requireNumber(value.articleCount, "coverage article count"),
    sourceCount: requireNumber(value.sourceCount, "coverage source count"),
    comparisonAvailable: requireBoolean(value.comparisonAvailable, "comparison availability"),
    sharedTopics: parseStrings(value.sharedTopics, "shared topic"),
    sharedEntities: value.sharedEntities.map(parseCoverageEntity),
    sources: value.sources.map(parseSourceCoverage),
    ...(localizedContent ? { localizedContent } : {}),
  };
}

export function parseStoryTimeline(value: unknown): StoryTimeline {
  if (!isRecord(value) || !Array.isArray(value.events)) {
    throw new ApiResponseError("Invalid Story timeline response.");
  }
  const localizedContent = parseLocalizedStoryContent(value.localizedContent);
  return {
    storyId: requireString(value.storyId, "timeline story ID"),
    canonicalTitle: requireString(value.canonicalTitle, "timeline Story title"),
    firstPublishedAt: requireDate(value.firstPublishedAt, "timeline first publication date"),
    lastPublishedAt: requireDate(value.lastPublishedAt, "timeline latest publication date"),
    eventCount: requireNumber(value.eventCount, "timeline event count"),
    sourceCount: requireNumber(value.sourceCount, "timeline source count"),
    events: value.events.map(parseTimelineEvent),
    ...(localizedContent ? { localizedContent } : {}),
  };
}

export function parsePagedArticles(value: unknown): PagedResponse<Article> {
  if (!isRecord(value) || !Array.isArray(value.content)) {
    throw new ApiResponseError("Invalid paged article response.");
  }
  return {
    content: value.content.map(parseArticle),
    page: requireNumber(value.page, "page"),
    size: requireNumber(value.size, "page size"),
    totalElements: requireNumber(value.totalElements, "total elements"),
    totalPages: requireNumber(value.totalPages, "total pages"),
    first: requireBoolean(value.first, "first page indicator"),
    last: requireBoolean(value.last, "last page indicator"),
  };
}

export function parsePagedStories(value: unknown): PagedResponse<StorySummary> {
  if (!isRecord(value) || !Array.isArray(value.content)) {
    throw new ApiResponseError("Invalid paged story response.");
  }
  return {
    content: value.content.map(parseStorySummary),
    page: requireNumber(value.page, "page"),
    size: requireNumber(value.size, "page size"),
    totalElements: requireNumber(value.totalElements, "total elements"),
    totalPages: requireNumber(value.totalPages, "total pages"),
    first: requireBoolean(value.first, "first page indicator"),
    last: requireBoolean(value.last, "last page indicator"),
  };
}

function parseAskStoryCitation(value: unknown): AskStoryCitation {
  if (!isRecord(value) || !isRecord(value.source)) {
    throw new ApiResponseError("Invalid Ask This Story citation response.");
  }
  return {
    number: requireNumber(value.number, "citation number"),
    articleId: requireString(value.articleId, "citation article ID"),
    title: requireString(value.title, "citation title"),
    source: {
      name: requireString(value.source.name, "citation source name"),
      slug: requireString(value.source.slug, "citation source slug"),
    },
    publishedAt: requireDate(value.publishedAt, "citation publication date"),
    originalUrl: requireHttpUrl(value.originalUrl, "citation original URL"),
  };
}

export function parseAskStoryResponse(value: unknown): AskStoryResponse {
  if (!isRecord(value) || !Array.isArray(value.citations)) {
    throw new ApiResponseError("Invalid Ask This Story response.");
  }
  return {
    storyId: requireString(value.storyId, "Ask This Story ID"),
    answerable: requireBoolean(value.answerable, "answerable indicator"),
    answer: requireString(value.answer, "grounded answer"),
    citations: value.citations.map(parseAskStoryCitation),
  };
}
