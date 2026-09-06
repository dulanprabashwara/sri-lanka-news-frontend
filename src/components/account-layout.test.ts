import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AccountLayout } from "./account/account-layout";

test("AccountLayout renders desktop sidebar and mobile navigation tabs", () => {
  const html = renderToStaticMarkup(
    createElement(
      AccountLayout,
      { title: "Account Overview", activeSection: "overview", displayLanguage: "en" },
      createElement("div", null, "Account Content")
    )
  );

  assert.match(html, /Account Overview/);
  assert.match(html, /aria-label="Account Settings"/);
  assert.match(html, /Overview/);
  assert.match(html, /Notifications/);
  assert.match(html, /Privacy &amp; Data|Privacy & Data/);
  assert.match(html, /Account Content/);
});

test("AccountLayout preserves display language parameter on navigation links", () => {
  const html = renderToStaticMarkup(
    createElement(
      AccountLayout,
      { title: "Account Settings", activeSection: "notifications", displayLanguage: "si" },
      createElement("div", null, "Settings Content")
    )
  );

  assert.match(html, /href="\/account\?lang=si"/);
  assert.match(html, /href="\/account\/notifications\?lang=si"/);
  assert.match(html, /href="\/account\/privacy\?lang=si"/);
});

test("AccountLayout does NOT render unsupported security or billing links", () => {
  const html = renderToStaticMarkup(
    createElement(
      AccountLayout,
      { title: "Account Overview", activeSection: "overview" },
      createElement("div", null, "Overview Content")
    )
  );

  assert.doesNotMatch(html, /Security/i);
  assert.doesNotMatch(html, /Billing/i);
  assert.doesNotMatch(html, /Password/i);
  assert.doesNotMatch(html, /Subscription/i);
});
