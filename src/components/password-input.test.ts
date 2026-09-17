import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PasswordInput, passwordInputType } from "./password-input";

test("password field is concealed by default with an accessible visibility control", () => {
  const html = renderToStaticMarkup(
    createElement(PasswordInput, {
      label: "Password",
      name: "password",
      autoComplete: "current-password",
    }),
  );

  assert.match(html, /type="password"/);
  assert.match(html, /aria-label="Show password"/);
  assert.match(html, /type="button"/);
});

test("password visibility changes only the input type", () => {
  assert.equal(passwordInputType(false), "password");
  assert.equal(passwordInputType(true), "text");
});
