import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MobileNavigationDrawer,
  reduceMobileMenuState,
} from "./mobile-navigation";

test("mobile menu opens with toggle and closes for escape, backdrop, and route selection", () => {
  assert.equal(reduceMobileMenuState(false, "toggle"), true);
  assert.equal(reduceMobileMenuState(true, "escape"), false);
  assert.equal(reduceMobileMenuState(true, "backdrop"), false);
  assert.equal(reduceMobileMenuState(true, "route"), false);
});

test("mobile menu includes essential navigation and the full Ceylon News wordmark", () => {
  const html = renderToStaticMarkup(
    createElement(MobileNavigationDrawer, {
      open: true,
      authenticated: true,
      admin: false,
      onClose: () => {},
      onSignOut: () => {},
      onLanguageChange: () => {},
    }),
  );

  for (const label of [
    "Latest news",
    "Stories",
    "Trending",
    "Search",
    "My News",
    "Notifications",
    "Account settings",
    "Sign out",
  ]) {
    assert.match(html, new RegExp(label, "i"));
  }
  assert.match(html, /ceylon-news-logo\.png/);
  assert.doesNotMatch(html, /ceylon-news-mark\.png/);
  assert.doesNotMatch(html, /Admin portal/i);
});

test("mobile menu exposes admin navigation only to admins", () => {
  const regular = renderToStaticMarkup(
    createElement(MobileNavigationDrawer, {
      open: true,
      authenticated: true,
      admin: false,
      onClose: () => {},
      onSignOut: () => {},
      onLanguageChange: () => {},
    }),
  );
  const admin = renderToStaticMarkup(
    createElement(MobileNavigationDrawer, {
      open: true,
      authenticated: true,
      admin: true,
      onClose: () => {},
      onSignOut: () => {},
      onLanguageChange: () => {},
    }),
  );

  assert.doesNotMatch(regular, /Admin portal/i);
  assert.match(admin, /Admin portal/i);
});
