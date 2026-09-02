import assert from "node:assert/strict";
import test from "node:test";
import {
  createBookmark,
  deleteBookmark,
  listBookmarks,
  parseBookmarkStatus,
  parsePreferences,
  preferredDisplayLanguage,
  resolveDisplayLanguage,
  updatePreferences,
} from "./user";

const originalBaseUrl = process.env.API_BASE_URL;
const originalFetch = globalThis.fetch;

test.beforeEach(() => { process.env.API_BASE_URL = "http://localhost:8080"; });

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBaseUrl;
});

test("parses defaults and maps a saved display preference", () => {
  const preferences = parsePreferences({ preferredDisplayLanguage: "ORIGINAL", preferredCategories: [], createdAt: null, updatedAt: null });
  assert.equal(preferredDisplayLanguage(preferences.preferredDisplayLanguage), undefined);
  assert.equal(preferredDisplayLanguage("SI"), "si");
  assert.deepEqual(preferences.preferredCategories, []);
  assert.equal(resolveDisplayLanguage("ta", "SI"), "ta");
  assert.equal(resolveDisplayLanguage(undefined, "EN"), "en");
  assert.equal(resolveDisplayLanguage(undefined), undefined);
});

test("rejects malformed preference and bookmark status payloads", () => {
  assert.throws(() => parsePreferences({ preferredDisplayLanguage: "INVALID", preferredCategories: [] }));
  assert.throws(() => parseBookmarkStatus({ bookmarked: "yes" }));
});

test("uses protected preference and bookmark requests without owner data", async () => {
  const requests: Array<{ path: string; method: string; authorization: string | null; body?: unknown }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ path: new URL(String(input)).pathname + new URL(String(input)).search, method: init?.method ?? "GET", authorization: new Headers(init?.headers).get("authorization"), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (init?.method === "DELETE") return new Response(null, { status: 204 });
    if (new URL(String(input)).pathname.endsWith("preferences")) return Response.json({ preferredDisplayLanguage: "EN", preferredCategories: ["LOCAL"], createdAt: "2026-09-02T00:00:00Z", updatedAt: "2026-09-02T00:00:00Z" });
    if (new URL(String(input)).pathname.endsWith("bookmarks")) return Response.json({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true });
    return Response.json({ bookmarked: true, createdAt: "2026-09-02T00:00:00Z" });
  }) as typeof fetch;

  await updatePreferences("jwt", { preferredDisplayLanguage: "EN", preferredCategories: ["LOCAL"] });
  await createBookmark("jwt", "ARTICLE", "article-1");
  await deleteBookmark("jwt", "STORY", "story-1");
  await listBookmarks("jwt", { type: "ARTICLE", displayLanguage: "si" });

  assert.deepEqual(requests.map(({ path, method }) => [path, method]), [
    ["/api/v1/me/preferences", "PUT"],
    ["/api/v1/me/bookmarks/articles/article-1", "POST"],
    ["/api/v1/me/bookmarks/stories/story-1", "DELETE"],
    ["/api/v1/me/bookmarks?page=0&size=20&type=ARTICLE&displayLanguage=si", "GET"],
  ]);
  assert.ok(requests.every((request) => request.authorization === "Bearer jwt"));
  assert.deepEqual(requests[0]?.body, { preferredDisplayLanguage: "EN", preferredCategories: ["LOCAL"] });
});
