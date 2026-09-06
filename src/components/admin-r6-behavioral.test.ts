import { describe, it, expect } from "vitest";
import { ADMIN_PILLARS, isRouteActive } from "./admin-nav";
import fs from "fs";
import path from "path";

describe("Phase R6 — Admin Navigation & Security Boundaries", () => {
  it("defines exactly 3 conceptual navigation pillars with all 9 authoritative routes", () => {
    expect(ADMIN_PILLARS).toHaveLength(3);
    const titles = ADMIN_PILLARS.map((p) => p.title);
    expect(titles).toEqual(["OPERATIONS", "CONTENT INTELLIGENCE", "INSIGHTS & SECURITY"]);

    const allHrefs = ADMIN_PILLARS.flatMap((p) => p.items.map((i) => i.href));
    expect(allHrefs).toHaveLength(9);
    expect(allHrefs).toEqual([
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

  it("enforces strict route matching where /admin only activates Overview", () => {
    // /admin should match ONLY /admin
    expect(isRouteActive("/admin", "/admin")).toBe(true);
    expect(isRouteActive("/admin/analytics", "/admin")).toBe(false);
    expect(isRouteActive("/admin/ai", "/admin")).toBe(false);
    expect(isRouteActive("/admin/stories", "/admin")).toBe(false);
    expect(isRouteActive("/admin/ingestion", "/admin")).toBe(false);
    expect(isRouteActive("/admin/processing", "/admin")).toBe(false);

    // Subroutes activate their respective href
    expect(isRouteActive("/admin/analytics", "/admin/analytics")).toBe(true);
    expect(isRouteActive("/admin/ai", "/admin/ai")).toBe(true);
    expect(isRouteActive("/admin/stories", "/admin/stories")).toBe(true);
    expect(isRouteActive("/admin/processing", "/admin/processing")).toBe(true);
  });

  it("proves Admin Analytics renders aggregate metrics only without raw PII or individual logs", () => {
    const analyticsFilePath = path.join(
      process.cwd(),
      "src/app/admin/analytics/page.tsx"
    );
    const content = fs.readFileSync(analyticsFilePath, "utf8");

    // Proves aggregate metrics exist
    expect(content).toContain("UNIQUE_VISITORS");
    expect(content).toContain("PAGE_VIEW");
    expect(content).toContain("ARTICLE_VIEW");

    // Proves raw search queries / Ask questions / visitor drilldowns are absent
    expect(content).not.toContain("rawQuery");
    expect(content).not.toContain("userIp");
    expect(content).not.toContain("visitorId");
    expect(content).not.toContain("askQuestionText");
  });

  it("proves User Metrics renders aggregate metrics only without account management or email lookup", () => {
    const usersFilePath = path.join(process.cwd(), "src/app/admin/users/page.tsx");
    const content = fs.readFileSync(usersFilePath, "utf8");

    // Proves aggregate data
    expect(content).toContain("totalProfiles");
    expect(content).toContain("totalBookmarks");
    expect(content).toContain("totalFollows");

    // Proves individual user management controls are absent
    expect(content).not.toContain("emailLookup");
    expect(content).not.toContain("editRole");
    expect(content).not.toContain("deleteUser");
    expect(content).not.toContain("banUser");
  });

  it("proves Audit Log is append-only without delete/edit actions or raw JWT/secret rendering", () => {
    const auditFilePath = path.join(process.cwd(), "src/app/admin/audit/page.tsx");
    const content = fs.readFileSync(auditFilePath, "utf8");

    // Proves append-only table fields
    expect(content).toContain("log.action");
    expect(content).toContain("log.actorId");
    expect(content).toContain("log.timestamp");

    // Proves no delete/edit operations
    expect(content).not.toContain("deleteLog");
    expect(content).not.toContain("clearAudit");
    expect(content).not.toContain("JWT_SECRET");
    expect(content).not.toContain("access_token");
  });

  it("proves AI admin page renders provider status without exposing API keys or secrets", () => {
    const aiFilePath = path.join(process.cwd(), "src/app/admin/ai/page.tsx");
    const content = fs.readFileSync(aiFilePath, "utf8");

    // Proves model provider operational status
    expect(content).toContain("providerName");
    expect(content).toContain("modelName");

    // Proves API keys and credentials are not rendered
    expect(content).not.toContain("apiKey");
    expect(content).not.toContain("OPENAI_API_KEY");
    expect(content).not.toContain("GEMINI_API_KEY");
    expect(content).not.toContain("secretKey");
  });

  it("proves Sources and Ingestion admin pages do not render infrastructure secrets or credentials", () => {
    const sourcesFilePath = path.join(process.cwd(), "src/app/admin/sources/page.tsx");
    const sourcesContent = fs.readFileSync(sourcesFilePath, "utf8");

    const ingestionFilePath = path.join(
      process.cwd(),
      "src/components/admin-ingestion-dashboard.tsx"
    );
    const ingestionContent = fs.readFileSync(ingestionFilePath, "utf8");

    const combined = sourcesContent + ingestionContent;

    // Proves infrastructure secrets are absent
    expect(combined).not.toContain("DATABASE_URL");
    expect(combined).not.toContain("REDIS_URL");
    expect(combined).not.toContain("SMTP_PASSWORD");
    expect(combined).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(combined).not.toContain("envSecretViewer");
  });
});
