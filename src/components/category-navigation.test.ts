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
  assert.match(html, /flex-wrap/);
  assert.doesNotMatch(html, /min-w-max/);
});
