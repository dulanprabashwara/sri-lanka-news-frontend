import {
  ARTICLE_CATEGORIES,
  type Article,
  type ArticleCategory,
  type CoverageArticle,
  type CoverageComparison,
  type CoverageEntity,
  type CoverageSource,
  type Language,
  type PagedResponse,
  type Source,
  type SourceSummary,
  type StoryDetail,
  type StorySummary,
  type SourceCoverage,
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
  return {
    id: requireString(value.id, "coverage article ID"),
    title: requireString(value.title, "coverage article title"),
    summary: optionalString(value.summary, "coverage article summary"),
    originalLanguage: parseLanguage(value.originalLanguage),
    publishedAt: requireDate(value.publishedAt, "coverage publication date"),
    originalUrl: requireHttpUrl(value.originalUrl, "coverage original URL"),
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
  };
}

export function parseStorySummary(value: unknown): StorySummary {
  if (!isRecord(value)) {
    throw new ApiResponseError("Invalid story response.");
  }
  return {
    id: requireString(value.id, "story ID"),
    canonicalTitle: requireString(value.canonicalTitle, "story title"),
    category: parseCategory(value.category),
    firstPublishedAt: requireDate(value.firstPublishedAt, "first publication date"),
    lastPublishedAt: requireDate(value.lastPublishedAt, "latest publication date"),
    articleCount: requireNumber(value.articleCount, "article count"),
    sourceCount: requireNumber(value.sourceCount, "source count"),
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
  return {
    storyId: requireString(value.storyId, "coverage story ID"),
    canonicalTitle: requireString(value.canonicalTitle, "coverage story title"),
    articleCount: requireNumber(value.articleCount, "coverage article count"),
    sourceCount: requireNumber(value.sourceCount, "coverage source count"),
    comparisonAvailable: requireBoolean(value.comparisonAvailable, "comparison availability"),
    sharedTopics: parseStrings(value.sharedTopics, "shared topic"),
    sharedEntities: value.sharedEntities.map(parseCoverageEntity),
    sources: value.sources.map(parseSourceCoverage),
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
