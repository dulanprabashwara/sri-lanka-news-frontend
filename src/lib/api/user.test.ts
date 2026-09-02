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
  createSourceFollow,
  createTopicFollow,
  deleteSourceFollow,
  deleteTopicFollow,
  getFollowBatchStatus,
  listFollows,
  parseFollowBatchStatus,
  parsePagedFollows,
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

test("parses source/topic follows and batched status without private keys", () => {
  const page = parsePagedFollows({
    content: [
      { followId: "f1", targetType: "SOURCE", createdAt: "2026-09-02T00:00:00Z", source: { name: "Daily Mirror", slug: "daily-mirror", baseUrl: "https://www.dailymirror.lk" }, topic: null, userId: "ignored", targetKey: "ignored" },
      { followId: "f2", targetType: "TOPIC", createdAt: "2026-09-02T00:01:00Z", source: null, topic: { label: "Cricket" } },
    ], page: 0, size: 20, totalElements: 2, totalPages: 1, first: true, last: true,
  });
  assert.equal(page.content[0]?.source?.slug, "daily-mirror");
  assert.equal(page.content[1]?.topic?.label, "Cricket");
  assert.equal("targetKey" in page.content[0]!, false);
  assert.deepEqual(parseFollowBatchStatus({ sources: [{ slug: "daily-mirror", followed: true, followedAt: "2026-09-02T00:00:00Z" }], topics: [{ topic: "Cricket", followed: false, followedAt: null }] }).topics[0], { topic: "Cricket", followed: false, followedAt: null });
});

test("uses one protected batch request and owner-free follow mutations", async () => {
  const requests: Array<{ path: string; method: string; body?: unknown }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    requests.push({ path: url.pathname + url.search, method: init?.method ?? "GET", body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (init?.method === "DELETE") return new Response(null, { status: 204 });
    if (url.pathname.endsWith("/status")) return Response.json({ sources: [], topics: [{ topic: "Cricket", followed: true, followedAt: "2026-09-02T00:00:00Z" }] });
    if (url.pathname === "/api/v1/me/follows") return Response.json({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true });
    return Response.json({ followed: true, followedAt: "2026-09-02T00:00:00Z" });
  }) as typeof fetch;

  await createSourceFollow("jwt", "daily-mirror");
  await deleteSourceFollow("jwt", "daily-mirror");
  await createTopicFollow("jwt", "Drug Trafficking");
  await deleteTopicFollow("jwt", "Drug Trafficking");
  await getFollowBatchStatus("jwt", [], ["Cricket", "Elections"]);
  await listFollows("jwt", { type: "TOPIC" });

  assert.deepEqual(requests.map(({ path, method }) => [path, method]), [
    ["/api/v1/me/follows/sources/daily-mirror", "POST"],
    ["/api/v1/me/follows/sources/daily-mirror", "DELETE"],
    ["/api/v1/me/follows/topics", "POST"],
    ["/api/v1/me/follows/topics?topic=Drug%20Trafficking", "DELETE"],
    ["/api/v1/me/follows/status", "POST"],
    ["/api/v1/me/follows?page=0&size=20&type=TOPIC", "GET"],
  ]);
  assert.deepEqual(requests[2]?.body, { topic: "Drug Trafficking" });
  assert.deepEqual(requests[4]?.body, { sourceSlugs: [], topics: ["Cricket", "Elections"] });
  assert.ok(requests.every((request) => request.body == null || !("userId" in (request.body as Record<string, unknown>))));
});
