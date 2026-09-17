import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminIngestionDashboard } from "./admin-ingestion-dashboard";

test("admin ingestion distinguishes active Lakbima from disabled Hiru", () => {
  const source = (sourceSlug: string, displayName: string, enabled: boolean) => ({
    sourceId: `${sourceSlug}-id`, sourceSlug, displayName, language: "si" as const, enabled,
    intervalMinutes: 15, jitterSeconds: 120, health: enabled ? "NEVER_RUN" as const : "PAUSED" as const,
    lastAttemptAt: null, lastSuccessAt: null, lastFailureAt: null, lastRunStatus: null,
    lastRunId: null, lastDiscovered: null, lastSubmitted: null, lastSucceeded: null,
    lastFailed: null, consecutiveFailures: 0,
  });
  const html = renderToStaticMarkup(createElement(AdminIngestionDashboard, {
    sources: [source("lakbima-news", "Lakbima News", true), source("hiru-news-sinhala", "Hiru News", false)],
    runs: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true },
    updateSettings: async () => {}, triggerRun: async () => {},
  }));

  assert.match(html, /Lakbima News/);
  assert.match(html, /Hiru News/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>[\s\S]*Disabled/);
  assert.match(html, /Run Now/);
  assert.match(html, /aria-label="Publisher source cards"/);
  assert.match(html, /lg:hidden/);
});
