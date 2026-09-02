import { requestJson } from "@/lib/api/client";

export interface CurrentUser {
  authenticated: true;
  userId: string;
  email: string | null;
}

export function parseCurrentUser(value: unknown): CurrentUser {
  if (!value || typeof value !== "object") throw new Error("Invalid account response.");
  const record = value as Record<string, unknown>;
  if (record.authenticated !== true || typeof record.userId !== "string") {
    throw new Error("Invalid account response.");
  }
  return { authenticated: true, userId: record.userId, email: typeof record.email === "string" ? record.email : null };
}

export function getCurrentUser(accessToken: string) {
  return requestJson("/api/v1/me", parseCurrentUser, { accessToken });
}
