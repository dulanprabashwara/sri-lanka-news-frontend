import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("successful password sign-in always returns users to the homepage", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src/components/auth-form.tsx"), "utf8");

  assert.match(source, /signInWithPassword[\s\S]*?router\.replace\("\/"\)[\s\S]*?router\.refresh\(\)/);
  assert.doesNotMatch(source, /mode === "login"[\s\S]*?router\.replace\(safeNextPath\(next/);
});
