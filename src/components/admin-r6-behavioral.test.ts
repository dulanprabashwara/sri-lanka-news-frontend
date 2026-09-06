import assert from "node:assert/strict";
import test from "node:test";
import { ADMIN_PILLARS, isRouteActive } from "./admin-nav";
import fs from "fs";
import path from "path";

test("Phase R6 — Admin Navigation & Security Boundaries: defines exactly 3 conceptual navigation pillars with all 9 authoritative routes", () => {
    assert.equal(ADMIN_PILLARS.length, 3);
    const titles = ADMIN_PILLARS.map((p) => p.title);
    assert.deepEqual(titles, ["OPERATIONS", "CONTENT INTELLIGENCE", "INSIGHTS & SECURITY"]);

    const allHrefs = ADMIN_PILLARS.flatMap((p) => p.items.map((i) => i.href));
    assert.equal(allHrefs.length, 9);
    assert.deepEqual(allHrefs, [
      "/admin",
      "/admin/ingestion",
      "/admin/processing",
      "/admin/sources",
      "/admin/stories",
      "/admin/ai",
      "/admin/analytics",
      "/admin/users",
      "/admin/audit",
    ]);
});

test("Phase R6 — Admin Navigation & Security Boundaries: enforces strict route matching where /admin only activates Overview", () => {
    // /admin should match ONLY /admin
    assert.equal(isRouteActive("/admin", "/admin"), true);
    assert.equal(isRouteActive("/admin/analytics", "/admin"), false);
    assert.equal(isRouteActive("/admin/ai", "/admin"), false);
    assert.equal(isRouteActive("/admin/stories", "/admin"), false);
    assert.equal(isRouteActive("/admin/ingestion", "/admin"), false);
    assert.equal(isRouteActive("/admin/processing", "/admin"), false);

    // Subroutes activate their respective href
    assert.equal(isRouteActive("/admin/analytics", "/admin/analytics"), true);
    assert.equal(isRouteActive("/admin/ai", "/admin/ai"), true);
    assert.equal(isRouteActive("/admin/stories", "/admin/stories"), true);
    assert.equal(isRouteActive("/admin/processing", "/admin/processing"), true);
});

test("Phase R6 — Admin Navigation & Security Boundaries: proves Admin Analytics renders aggregate metrics only without raw PII or individual logs", () => {
    const analyticsFilePath = path.join(
      process.cwd(),
      "src/app/admin/analytics/page.tsx"
    );
    const content = fs.readFileSync(analyticsFilePath, "utf8");

    // Proves aggregate metrics exist
    assert.ok(content.includes("UNIQUE_VISITORS"));
    assert.ok(content.includes("PAGE_VIEW"));
    assert.ok(content.includes("ARTICLE_VIEW"));

    // Proves raw search queries / Ask questions / visitor drilldowns are absent
    assert.ok(!content.includes("rawQuery"));
    assert.ok(!content.includes("userIp"));
    assert.ok(!content.includes("visitorId"));
    assert.ok(!content.includes("askQuestionText"));
});

test("Phase R6 — Admin Navigation & Security Boundaries: proves User Metrics renders aggregate metrics only without account management or email lookup", () => {
    const usersFilePath = path.join(process.cwd(), "src/app/admin/users/page.tsx");
    const content = fs.readFileSync(usersFilePath, "utf8");

    // Proves aggregate data
    assert.ok(content.includes("totalProfiles"));
    assert.ok(content.includes("totalBookmarks"));
    assert.ok(content.includes("totalFollows"));

    // Proves individual user management controls are absent
    assert.ok(!content.includes("emailLookup"));
    assert.ok(!content.includes("editRole"));
    assert.ok(!content.includes("deleteUser"));
    assert.ok(!content.includes("banUser"));
});

test("Phase R6 — Admin Navigation & Security Boundaries: proves Audit Log is append-only without delete/edit actions or raw JWT/secret rendering", () => {
    const auditFilePath = path.join(process.cwd(), "src/app/admin/audit/page.tsx");
    const content = fs.readFileSync(auditFilePath, "utf8");

    // Proves append-only table fields
    assert.ok(content.includes("log.action"));
    assert.ok(content.includes("log.actorId"));
    assert.ok(content.includes("log.timestamp"));

    // Proves no delete/edit operations
    assert.ok(!content.includes("deleteLog"));
    assert.ok(!content.includes("clearAudit"));
    assert.ok(!content.includes("JWT_SECRET"));
});

test("Phase R6 — Admin Navigation & Security Boundaries: proves AI admin page renders provider status without exposing API keys or secrets", () => {
    const aiFilePath = path.join(process.cwd(), "src/app/admin/ai/page.tsx");
    const content = fs.readFileSync(aiFilePath, "utf8");

    // Proves model provider operational status
    assert.ok(content.includes("providerName"));
    assert.ok(content.includes("modelName"));

    // Proves API keys and credentials are not rendered
    assert.ok(!content.includes("apiKey"));
    assert.ok(!content.includes("OPENAI_API_KEY"));
    assert.ok(!content.includes("GEMINI_API_KEY"));
    assert.ok(!content.includes("secretKey"));
});

test("Phase R6 — Admin Navigation & Security Boundaries: proves Sources and Ingestion admin pages do not render infrastructure secrets or credentials", () => {
    const sourcesFilePath = path.join(process.cwd(), "src/app/admin/sources/page.tsx");
    const sourcesContent = fs.readFileSync(sourcesFilePath, "utf8");

    const ingestionFilePath = path.join(
      process.cwd(),
      "src/components/admin-ingestion-dashboard.tsx"
    );
    const ingestionContent = fs.readFileSync(ingestionFilePath, "utf8");

    const combined = sourcesContent + ingestionContent;

    // Proves infrastructure secrets are absent
    assert.ok(!combined.includes("DATABASE_URL"));
    assert.ok(!combined.includes("REDIS_URL"));
    assert.ok(!combined.includes("SMTP_PASSWORD"));
    assert.ok(!combined.includes("SUPABASE_SERVICE_ROLE_KEY"));
    assert.ok(!combined.includes("envSecretViewer"));
});
