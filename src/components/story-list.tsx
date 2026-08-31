import { StoryCard } from "@/components/story-card";
import type { StorySummary } from "@/types/api";

export function StoryList({ stories }: { stories: StorySummary[] }) {
  if (stories.length === 0) {
    return (
      <div className="state-panel" role="status">
        <h2 className="text-lg font-bold text-slate-900">No stories yet</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Grouped news coverage will appear here when it is available.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:gap-5">
      {stories.map((story) => <StoryCard key={story.id} story={story} />)}
    </div>
  );
}
