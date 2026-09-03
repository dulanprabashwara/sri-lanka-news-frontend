"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import { retryAdminArticle, updateAdminIngestionSettings, triggerManualIngestionRun } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

export async function retryFailedArticle(articleId: string) {
  const token = await getAuthenticatedAccessToken();
  if (!token) throw new Error("Authentication is required.");
  await retryAdminArticle(articleId, token);
  revalidatePath("/admin");
}

export async function updateIngestionSettings(
  sourceSlug: string,
  settings: { enabled: boolean; intervalMinutes: number; jitterSeconds: number }
) {
  const token = await getAuthenticatedAccessToken();
  if (!token) throw new Error("Authentication is required.");
  await updateAdminIngestionSettings(sourceSlug, settings, token);
  revalidatePath("/admin/ingestion");
}

export async function triggerIngestionRun(sourceSlug: string) {
  const token = await getAuthenticatedAccessToken();
  if (!token) throw new Error("Authentication is required.");
  try {
    await triggerManualIngestionRun(sourceSlug, token);
  } catch (error) {
    // 409 Conflict indicates a manual trigger is already pending/active
    if (error instanceof ApiError && error.status === 409) {
      // Ignore and proceed to revalidate
    } else {
      throw error;
    }
  }
  revalidatePath("/admin/ingestion");
}
