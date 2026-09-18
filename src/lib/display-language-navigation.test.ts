import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDisplayLanguagePath,
  navigateToDisplayLanguage,
} from "./display-language-navigation";

test("mobile language navigation preserves filters and replaces the requested language", () => {
  assert.equal(
    buildDisplayLanguagePath(
      "/?category=POLITICS&lang=en",
      "ta",
    ),
    "/?category=POLITICS&lang=ta",
  );
  assert.equal(buildDisplayLanguagePath("/articles?lang=si", "original"), "/articles");
});

test("language changes perform a full navigation so server-fetched articles are refreshed", () => {
  let assigned = "";
  navigateToDisplayLanguage(
    { assign: (url) => { assigned = String(url); } },
    "/?category=LOCAL",
    "si",
  );

  assert.equal(assigned, "/?category=LOCAL&lang=si");
});
