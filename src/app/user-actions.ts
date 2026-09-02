"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import { createBookmark, deleteBookmark, updatePreferences } from "@/lib/api/user";
import type { ArticleCategory, BookmarkTargetType, PreferredDisplayLanguage } from "@/types/api";

async function token() {
  const value = await getAuthenticatedAccessToken();
  if (!value) throw new Error("Your session has expired. Please sign in again.");
  return value;
}

export async function savePreferencesAction(input: { preferredDisplayLanguage: PreferredDisplayLanguage; preferredCategories: ArticleCategory[] }) {
  try {
    const preferences = await updatePreferences(await token(), input);
    revalidatePath("/account");
    return { ok: true as const, preferences };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "Unable to save preferences." };
  }
}

export async function setBookmarkAction(input: { type: BookmarkTargetType; targetId: string; bookmarked: boolean }) {
  try {
    const accessToken = await token();
    if (input.bookmarked) await deleteBookmark(accessToken, input.type, input.targetId);
    else await createBookmark(accessToken, input.type, input.targetId);
    revalidatePath("/bookmarks");
    return { ok: true as const, bookmarked: !input.bookmarked };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "Unable to update bookmark." };
  }
}
