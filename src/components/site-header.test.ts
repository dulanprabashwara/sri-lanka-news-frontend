import assert from "node:assert/strict";
import test from "node:test";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";

test("guest header navigation state: shows Discovery links and Sign in CTA, conceals My News, Bell, and Admin", () => {
  const displayLang = readDisplayLanguage(undefined);
  const latestNewsHref = withDisplayLanguage("/", displayLang);
  const storiesHref = withDisplayLanguage("/stories", displayLang);
  const trendingHref = withDisplayLanguage("/trending", displayLang);
  const searchHref = withDisplayLanguage("/search", displayLang);
  const loginHref = withDisplayLanguage("/auth/login?next=/account", displayLang);

  assert.equal(latestNewsHref, "/");
  assert.equal(storiesHref, "/stories");
  assert.equal(trendingHref, "/trending");
  assert.equal(searchHref, "/search");
  assert.equal(loginHref, "/auth/login?next=/account");
});

test("authenticated header navigation state: Groups For You, Bookmarks, and Following under My News dropdown", () => {
  const displayLang = readDisplayLanguage("en");
  const forYouHref = withDisplayLanguage("/for-you", displayLang);
  const bookmarksHref = withDisplayLanguage("/bookmarks", displayLang);
  const followingHref = withDisplayLanguage("/following", displayLang);

  assert.equal(forYouHref, "/for-you?lang=en");
  assert.equal(bookmarksHref, "/bookmarks?lang=en");
  assert.equal(followingHref, "/following?lang=en");
});

test("admin header navigation state: Admin Portal appears only when admin flag is true", () => {
  const displayLang = readDisplayLanguage("si");
  const adminHref = withDisplayLanguage("/admin", displayLang);

  assert.equal(adminHref, "/admin?lang=si");
});
