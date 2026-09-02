import { requestJson, requestNoContent } from "@/lib/api/client";
import { parseArticle, parsePagedStories, parseStorySummary } from "@/lib/api/parsers";
import type {
  ArticleCategory,
  Bookmark,
  BookmarkStatus,
  BookmarkTargetType,
  DisplayLanguage,
  PagedResponse,
  PreferredDisplayLanguage,
  UserPreferences,
} from "@/types/api";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid user API response.");
  return value as Record<string, unknown>;
}

function string(value: unknown): string {
  if (typeof value !== "string" || !value) throw new Error("Invalid user API response.");
  return value;
}

function nullableDate(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const result = string(value);
  if (Number.isNaN(Date.parse(result))) throw new Error("Invalid user API response.");
  return result;
}

export function parsePreferences(value: unknown): UserPreferences {
  const data = record(value);
  const language = data.preferredDisplayLanguage;
  if (language !== "ORIGINAL" && language !== "EN" && language !== "SI" && language !== "TA") {
    throw new Error("Invalid preference response.");
  }
  if (!Array.isArray(data.preferredCategories)) throw new Error("Invalid preference response.");
  return {
    preferredDisplayLanguage: language,
    preferredCategories: data.preferredCategories.map((category) => string(category) as ArticleCategory),
    createdAt: nullableDate(data.createdAt),
    updatedAt: nullableDate(data.updatedAt),
  };
}

export function parseBookmarkStatus(value: unknown): BookmarkStatus {
  const data = record(value);
  if (typeof data.bookmarked !== "boolean") throw new Error("Invalid bookmark response.");
  return { bookmarked: data.bookmarked, createdAt: nullableDate(data.createdAt) };
}

export function parseBookmark(value: unknown): Bookmark {
  const data = record(value);
  const targetType = data.targetType;
  if (targetType !== "ARTICLE" && targetType !== "STORY") throw new Error("Invalid bookmark response.");
  return {
    bookmarkId: string(data.bookmarkId),
    targetType,
    targetId: string(data.targetId),
    createdAt: string(data.createdAt),
    article: data.article == null ? null : parseArticle(data.article),
    story: data.story == null ? null : parseStorySummary(data.story),
  };
}

export function parsePagedBookmarks(value: unknown): PagedResponse<Bookmark> {
  const data = record(value);
  if (!Array.isArray(data.content)) throw new Error("Invalid bookmark list response.");
  const emptyStories = parsePagedStories({ ...data, content: [] });
  return { ...emptyStories, content: data.content.map(parseBookmark) };
}

export function getPreferences(accessToken: string) {
  return requestJson("/api/v1/me/preferences", parsePreferences, { accessToken });
}

export function updatePreferences(accessToken: string, preferences: Pick<UserPreferences, "preferredDisplayLanguage" | "preferredCategories">) {
  return requestJson("/api/v1/me/preferences", parsePreferences, { accessToken, method: "PUT", body: preferences });
}

function targetPath(type: BookmarkTargetType, targetId: string) {
  return `/api/v1/me/bookmarks/${type === "ARTICLE" ? "articles" : "stories"}/${encodeURIComponent(targetId)}`;
}

export function getBookmarkStatus(accessToken: string, type: BookmarkTargetType, targetId: string) {
  return requestJson(targetPath(type, targetId), parseBookmarkStatus, { accessToken });
}

export function createBookmark(accessToken: string, type: BookmarkTargetType, targetId: string) {
  return requestJson(targetPath(type, targetId), parseBookmarkStatus, { accessToken, method: "POST" });
}

export function deleteBookmark(accessToken: string, type: BookmarkTargetType, targetId: string) {
  return requestNoContent(targetPath(type, targetId), { accessToken, method: "DELETE" });
}

export function listBookmarks(accessToken: string, options: { page?: number; size?: number; type?: BookmarkTargetType; displayLanguage?: DisplayLanguage } = {}) {
  const parameters = new URLSearchParams({ page: String(options.page ?? 0), size: String(options.size ?? 20) });
  if (options.type) parameters.set("type", options.type);
  if (options.displayLanguage) parameters.set("displayLanguage", options.displayLanguage);
  return requestJson(`/api/v1/me/bookmarks?${parameters}`, parsePagedBookmarks, { accessToken });
}

export function preferredDisplayLanguage(value: PreferredDisplayLanguage): DisplayLanguage | undefined {
  return value === "ORIGINAL" ? undefined : value.toLowerCase() as DisplayLanguage;
}

export function resolveDisplayLanguage(explicit: DisplayLanguage | undefined, preference?: PreferredDisplayLanguage): DisplayLanguage | undefined {
  return explicit ?? (preference ? preferredDisplayLanguage(preference) : undefined);
}
