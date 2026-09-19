import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CategoryNavigation } from "./category-navigation";

test("Browse desk categories preserve filtering and clearly identify the selection", () => {
  const html = renderToStaticMarkup(
    createElement(CategoryNavigation, {
      activeCategory: "POLITICS",
      displayLanguage: "si",
    }),
  );

  assert.match(html, /href="\/\?category=POLITICS&amp;lang=si"/);
  assert.match(html, /aria-current="page"[^>]*>Politics/);
  assert.match(html, /overflow-x-auto/);
  assert.match(html, /flex-nowrap/);
  assert.match(html, /min-w-max/);
});

test("CategoryNavigation renders responsive mobile dropdown with active selection", () => {
  const html = renderToStaticMarkup(
    createElement(CategoryNavigation, {
      activeCategory: "POLITICS",
      displayLanguage: "si",
    }),
  );

  assert.match(html, /<select[^>]*id="mobile-category-dropdown"/);
  assert.match(html, /<option value="POLITICS"[^>]*selected/);
  assert.match(html, /All Categories/);
  assert.match(html, /Politics/);
  assert.match(html, /Business/);
});
