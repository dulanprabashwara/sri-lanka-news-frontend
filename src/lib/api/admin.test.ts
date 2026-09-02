import assert from "node:assert/strict";
import test from "node:test";
import { getAdminArticles, getAdminMe, getAdminOverview, getAdminSources } from "./admin";

const originalFetch = globalThis.fetch;
const originalBaseUrl = process.env.API_BASE_URL;

test.beforeEach(() => { process.env.API_BASE_URL = "http://localhost:8080"; });
test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBaseUrl;
});

test("uses bearer authentication for bounded admin endpoints and parses safe DTOs", async () => {
  const paths: string[] = [];
  const authorizations: Array<string | null> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    paths.push(url.pathname + url.search);
    authorizations.push(new Headers(init?.headers).get("Authorization"));
    if (url.pathname.endsWith("/me")) return Response.json({ admin: true });
    if (url.pathname.endsWith("/overview")) return Response.json({
      sources: { total: 3 }, articles: { total: 10, pending: 1, processing: 1,
        completed: 6, retrying: 1, failed: 1 }, stories: { total: 4 }, recentFailures: [],
    });
    if (url.pathname.endsWith("/sources")) return Response.json([{
      id: "source-1", name: "NewsFirst", slug: "newsfirst", baseUrl: "https://example.com",
      defaultLanguage: "en", ingestionType: "HTML", enabled: true, articleCount: 5,
      createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z",
    }]);
    return Response.json([]);
  }) as typeof fetch;

  await Promise.all([
    getAdminMe("token"), getAdminOverview("token"),
    getAdminSources("token"), getAdminArticles("token", 25),
  ]);

  assert.deepEqual(paths, [
    "/api/v1/admin/me", "/api/v1/admin/overview", "/api/v1/admin/sources",
    "/api/v1/admin/articles?limit=25",
  ]);
  assert.ok(authorizations.every((value) => value === "Bearer token"));
});
