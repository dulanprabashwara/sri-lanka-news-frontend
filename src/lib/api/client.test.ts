import assert from "node:assert/strict";
import test from "node:test";
import { ApiConfigurationError } from "../../config/env";
import {
  ApiError,
  ApiUnavailableError,
  requestJson,
} from "./client";
import { ApiResponseError } from "./parsers";

const originalBaseUrl = process.env.API_BASE_URL;

test.beforeEach(() => {
  process.env.API_BASE_URL = "http://localhost:8080";
});

test.after(() => {
  if (originalBaseUrl === undefined) {
    delete process.env.API_BASE_URL;
  } else {
    process.env.API_BASE_URL = originalBaseUrl;
  }
});

test("returns parsed data for a successful response", async () => {
  const fetcher = (async (input: string | URL | Request) => {
    assert.equal(String(input), "http://localhost:8080/api/v1/example");
    return Response.json({ value: "ok" });
  }) as typeof fetch;

  const result = await requestJson(
    "/api/v1/example",
    (payload) => (payload as { value: string }).value,
    { fetcher },
  );
  assert.equal(result, "ok");
});

test("forwards a bearer token only when explicitly requested", async () => {
  const fetcher = (async (_input: string | URL | Request, init?: RequestInit) => {
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer validated-token");
    return Response.json({ value: "ok" });
  }) as typeof fetch;
  await requestJson("/api/v1/me", (payload) => payload, {
    fetcher,
    accessToken: "validated-token",
  });
});

test("public requests do not receive an authorization header", async () => {
  const fetcher = (async (_input: string | URL | Request, init?: RequestInit) => {
    assert.equal(new Headers(init?.headers).get("Authorization"), null);
    return Response.json({ value: "ok" });
  }) as typeof fetch;
  await requestJson("/api/v1/articles", (payload) => payload, { fetcher });
});

test("surfaces centralized backend errors for non-2xx responses", async () => {
  const fetcher = (async () =>
    Response.json(
      { detail: "Service is warming up" },
      { status: 503 },
    )) as typeof fetch;

  await assert.rejects(
    requestJson("/api/v1/example", (payload) => payload, { fetcher }),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 503 &&
      error.message === "Service is warming up",
  );
});

test("maps network failures to an unavailable error", async () => {
  const fetcher = (async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch;

  await assert.rejects(
    requestJson("/api/v1/example", (payload) => payload, { fetcher }),
    ApiUnavailableError,
  );
});

test("keeps missing environment configuration distinct from network failures", async () => {
  delete process.env.API_BASE_URL;

  await assert.rejects(
    requestJson("/api/v1/example", (payload) => payload),
    ApiConfigurationError,
  );
});

test("rejects invalid JSON from a successful response", async () => {
  const fetcher = (async () =>
    new Response("not-json", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;

  await assert.rejects(
    requestJson("/api/v1/example", (payload) => payload, { fetcher }),
    ApiResponseError,
  );
});
