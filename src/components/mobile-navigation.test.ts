import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  lockPageScroll,
  MobileNavigationDrawer,
  reduceMobileMenuState,
} from "./mobile-navigation";

test("open mobile navigation locks the page and restores its scroll position", () => {
  const bodyStyle = {
    overflow: "auto",
    position: "relative",
    top: "2px",
    width: "95%",
  };
  const rootStyle = { overflow: "visible", overscrollBehavior: "auto" };
  const restoredPositions: Array<[number, number]> = [];

  const unlock = lockPageScroll(
    {
      body: { style: bodyStyle },
      documentElement: { style: rootStyle },
    },
    {
      scrollY: 420,
      scrollTo: (x, y) => restoredPositions.push([x, y]),
    },
  );

  assert.equal(rootStyle.overflow, "hidden");
  assert.equal(rootStyle.overscrollBehavior, "none");
  assert.equal(bodyStyle.overflow, "hidden");
  assert.equal(bodyStyle.position, "fixed");
  assert.equal(bodyStyle.top, "-420px");
  assert.equal(bodyStyle.width, "100%");

  unlock();

  assert.deepEqual(rootStyle, {
    overflow: "visible",
    overscrollBehavior: "auto",
  });
  assert.deepEqual(bodyStyle, {
    overflow: "auto",
    position: "relative",
    top: "2px",
    width: "95%",
  });
  assert.deepEqual(restoredPositions, [[0, 420]]);
});

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
