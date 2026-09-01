import { getStoryTimeline } from "@/lib/api/news";
import type { StoryTimeline } from "@/types/api";

export async function getOptionalStoryTimeline(
  storyId: string,
  loader: (id: string) => Promise<StoryTimeline> = getStoryTimeline,
): Promise<StoryTimeline | null> {
  try {
    return await loader(storyId);
  } catch {
    return null;
  }
}
