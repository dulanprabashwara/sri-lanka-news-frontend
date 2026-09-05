/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";
import test from "node:test";
import { analyticsClient } from "./analytics-client";

test("analyticsClient respects DNT and GPC", () => {
  // Mock window and navigator
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;

  try {
    globalThis.window = { doNotTrack: '1' } as any;
    Object.defineProperty(globalThis, 'navigator', { value: { doNotTrack: '1' }, configurable: true });
    assert.equal(analyticsClient.getConsent(), false);

    globalThis.window = {} as any;
    Object.defineProperty(globalThis, 'navigator', { value: { globalPrivacyControl: true }, configurable: true });
    assert.equal(analyticsClient.getConsent(), false);

    globalThis.window = {} as any;
    Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true });
    // Requires localStorage to not be 'false'
    (globalThis as any).localStorage = { getItem: () => null };
    assert.equal(analyticsClient.getConsent(), true);
  } finally {
    globalThis.window = originalWindow;
    Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true });
  }
});

test("analyticsClient batching mechanism", async () => {
  // Clear any existing state
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;
  
  let fetchCalled = false;
  let sentPayload: any = null;
  globalThis.window = {} as any;
  Object.defineProperty(globalThis, 'navigator', { value: { sendBeacon: (url: string, data: any) => { fetchCalled = true; sentPayload = data; return true; } }, configurable: true });
  (globalThis as any).localStorage = { getItem: () => null };
  (globalThis as any).sessionStorage = { getItem: () => null, setItem: () => {} };
  
  try {
    for (let i = 0; i < 10; i++) {
      analyticsClient.track("ARTICLE_VIEW", { articleId: "test-" + i });
    }
    
    // The 10th event triggers flush()
    assert.equal(fetchCalled, true);
    const text = typeof sentPayload === 'string' ? sentPayload : await sentPayload.text();
    const parsed = JSON.parse(text);
    assert.equal(parsed.events.length, 10);
    assert.equal(parsed.events[9].articleId, "test-9");
  } finally {
    globalThis.window = originalWindow;
    Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true });
  }
});
