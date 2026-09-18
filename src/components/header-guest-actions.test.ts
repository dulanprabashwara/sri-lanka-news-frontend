import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HeaderGuestActions } from "./header-guest-actions";

test("guest navbar actions share a clear and consistent control hierarchy", () => {
  const html = renderToStaticMarkup(
    createElement(HeaderGuestActions, {
      displayLanguage: "en",
      searchActive: false,
      onLanguageChange: () => {},
    }),
  );

  assert.match(html, />Search</);
  assert.match(html, /aria-label="Display language"/);
  assert.match(html, />Sign in</);
  assert.equal((html.match(/min-h-11/g) ?? []).length >= 3, true);
  assert.match(html, /bg-brand/);
});
