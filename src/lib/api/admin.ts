import { requestJson, requestNoContent } from "@/lib/api/client";
import type {
  AdminArticle, AdminOverview, AdminSource, ProcessingStatus,
} from "@/types/api";

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${name} response.`);
  }
  return value as Record<string, unknown>;
}

function string(value: unknown, name: string) {
  if (typeof value !== "string" || !value) throw new Error(`Invalid ${name}.`);
  return value;
}

function number(value: unknown, name: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid ${name}.`);
  return value;
}

function status(value: unknown): ProcessingStatus {
  if (["PENDING", "PROCESSING", "COMPLETED", "FAILED", "RETRYING"].includes(String(value))) {
    return value as ProcessingStatus;
  }
  throw new Error("Invalid processing status.");
}

export function parseAdminArticle(value: unknown): AdminArticle {
  const item = record(value, "admin Article");
  const source = record(item.source, "admin Article source");
  return {
    articleId: string(item.articleId, "Article ID"),
    title: string(item.title, "Article title"),
    source: { name: string(source.name, "Source name"), slug: string(source.slug, "Source slug") },
    processingStatus: status(item.processingStatus),
    discoveredAt: string(item.discoveredAt, "discovered date"),
    publishedAt: string(item.publishedAt, "published date"),
  };
}

function parseAdminArticles(value: unknown): AdminArticle[] {
  if (!Array.isArray(value)) throw new Error("Invalid admin Articles response.");
  return value.map(parseAdminArticle);
}

export function parseAdminOverview(value: unknown): AdminOverview {
  const overview = record(value, "admin overview");
  const sources = record(overview.sources, "Source counts");
  const articles = record(overview.articles, "Article counts");
  const stories = record(overview.stories, "Story counts");
  return {
    sources: { total: number(sources.total, "Source total") },
    articles: {
      total: number(articles.total, "Article total"),
      pending: number(articles.pending, "pending total"),
      processing: number(articles.processing, "processing total"),
      completed: number(articles.completed, "completed total"),
      retrying: number(articles.retrying, "retrying total"),
      failed: number(articles.failed, "failed total"),
    },
    stories: { total: number(stories.total, "Story total") },
    recentFailures: parseAdminArticles(overview.recentFailures),
  };
}

function parseAdminSources(value: unknown): AdminSource[] {
  if (!Array.isArray(value)) throw new Error("Invalid admin Sources response.");
  return value.map((entry) => {
    const item = record(entry, "admin Source");
    const language = string(item.defaultLanguage, "Source language");
    const ingestionType = string(item.ingestionType, "ingestion type");
    if (!["en", "si", "ta"].includes(language) || !["RSS", "HTML"].includes(ingestionType)) {
      throw new Error("Invalid admin Source metadata.");
    }
    return {
      id: string(item.id, "Source ID"), name: string(item.name, "Source name"),
      slug: string(item.slug, "Source slug"), baseUrl: string(item.baseUrl, "Source URL"),
      defaultLanguage: language as AdminSource["defaultLanguage"],
      ingestionType: ingestionType as AdminSource["ingestionType"],
      enabled: item.enabled === true,
      articleCount: number(item.articleCount, "Source Article count"),
      createdAt: string(item.createdAt, "Source created date"),
      updatedAt: string(item.updatedAt, "Source updated date"),
    };
  });
}

export function getAdminMe(accessToken: string): Promise<{ admin: true }> {
  return requestJson("/api/v1/admin/me", (value) => {
    if (record(value, "admin identity").admin !== true) throw new Error("Invalid admin identity.");
    return { admin: true };
  }, { accessToken });
}

export function getAdminOverview(accessToken: string) {
  return requestJson("/api/v1/admin/overview", parseAdminOverview, { accessToken });
}

export function getAdminSources(accessToken: string) {
  return requestJson("/api/v1/admin/sources", parseAdminSources, { accessToken });
}

export function getAdminArticles(accessToken: string, limit = 25) {
  return requestJson(`/api/v1/admin/articles?limit=${limit}`, parseAdminArticles, { accessToken });
}

export function retryAdminArticle(articleId: string, accessToken: string) {
  return requestJson(`/api/v1/admin/articles/${encodeURIComponent(articleId)}/retry`,
    parseAdminArticle, { accessToken, method: "POST" });
}

export function getAdminIngestionSources(accessToken: string) {
  return requestJson("/api/v1/admin/ingestion/sources", (value) => {
    if (!Array.isArray(value)) throw new Error("Invalid response");
    return value;
  }, { accessToken });
}

export function updateAdminIngestionSettings(
  sourceSlug: string,
  settings: { enabled: boolean; intervalMinutes: number; jitterSeconds: number },
  accessToken: string
) {
  return requestNoContent(
    `/api/v1/admin/ingestion/sources/${encodeURIComponent(sourceSlug)}/settings`,
    { accessToken, method: "PUT", body: settings }
  );
}

export function triggerManualIngestionRun(sourceSlug: string, accessToken: string) {
  return requestNoContent(
    `/api/v1/admin/ingestion/sources/${encodeURIComponent(sourceSlug)}/trigger`,
    { accessToken, method: "POST" }
  );
}

export function getAdminIngestionRuns(accessToken: string, page = 0, size = 50) {
  return requestJson(`/api/v1/admin/ingestion/runs?page=${page}&size=${size}`, (value) => {
    return value as import("@/types/api").PagedResponse<import("@/types/api").AdminRunHistoryResponse>;
  }, { accessToken });
}
