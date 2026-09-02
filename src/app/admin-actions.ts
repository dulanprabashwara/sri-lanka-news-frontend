"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import { retryAdminArticle } from "@/lib/api/admin";

export async function retryFailedArticle(articleId: string) {
  const token = await getAuthenticatedAccessToken();
  if (!token) throw new Error("Authentication is required.");
  await retryAdminArticle(articleId, token);
  revalidatePath("/admin");
}
