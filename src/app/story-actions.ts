"use server";

import { askStory } from "@/lib/api/news";
import type { DisplayLanguage } from "@/types/api";

export async function askStoryAction(input: {
  storyId: string;
  question: string;
  displayLanguage?: DisplayLanguage;
}) {
  try {
    const response = await askStory(
      input.storyId,
      input.question,
      input.displayLanguage,
    );
    return { ok: true as const, response };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Ask This Story is temporarily unavailable.",
    };
  }
}
