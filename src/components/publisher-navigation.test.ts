import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PublisherDirectory } from "./publisher-directory";
import { PublisherStrip } from "./publisher-strip";
import { SourceIcon } from "./source-icon";

const sources = [
  {
    name: "Daily Mirror",
    slug: "daily-mirror",
    baseUrl: "https://www.dailymirror.lk",
  },
];

test("publisher directory links to source pages with selected language and official icons", () => {
  const html = renderToStaticMarkup(
    createElement(PublisherDirectory, { sources, displayLanguage: "si" }),
  );
  assert.match(html, /\/source\/daily-mirror\?lang=si/);
  assert.match(html, /Daily Mirror/);
  assert.match(html, /\/icons\/dailymirror.png/);
  assert.match(html, /referrerPolicy="no-referrer"/i);
});

test("publisher strip renders sources and hides the duplicate copy from accessibility tree", () => {
  const html = renderToStaticMarkup(createElement(PublisherStrip, { sources }));
  assert.match(html, /Across Sri Lanka’s newsrooms/);
  assert.match(html, /aria-hidden="true" class="publisher-track-copy/);
  assert.equal(
    renderToStaticMarkup(createElement(PublisherStrip, { sources: [] })),
    "",
  );
});

test("invalid icon URLs use initials without generating unsafe image requests", () => {
  const html = renderToStaticMarkup(
    createElement(SourceIcon, {
      name: "Daily Mirror",
      baseUrl: "javascript:alert(1)",
    }),
  );
  assert.match(html, />DM<\/span>/);
  assert.doesNotMatch(html, /<img/);
});

test("Lakbima uses its first-party favicon fallback and publisher link", () => {
  const html = renderToStaticMarkup(
    createElement(PublisherDirectory, {
      sources: [
        { name: "Lakbima News", slug: "lakbima-news", baseUrl: "https://lakbima.news" },
      ],
      displayLanguage: "si",
    }),
  );
  assert.match(html, /\/source\/lakbima-news\?lang=si/);
  assert.match(html, /Lakbima News/);
  assert.match(html, /googleusercontent\.com\/s2\/favicons\?domain=lakbima\.news/);
});
