import { getStoryTimeline } from "@/lib/api/news";
import type { StoryTimeline } from "@/types/api";
import type { DisplayLanguage } from "@/types/api";

export async function getOptionalStoryTimeline(
  storyId: string,
  displayLanguageOrLoader?: DisplayLanguage | ((id: string, language?: DisplayLanguage) => Promise<StoryTimeline>),
  loader: (id: string, language?: DisplayLanguage) => Promise<StoryTimeline> = getStoryTimeline,
): Promise<StoryTimeline | null> {
  const displayLanguage = typeof displayLanguageOrLoader === "function" ? undefined : displayLanguageOrLoader;
  const resolvedLoader = typeof displayLanguageOrLoader === "function" ? displayLanguageOrLoader : loader;
  try {
    return await resolvedLoader(storyId, displayLanguage);
  } catch {
    return null;
  }
}
