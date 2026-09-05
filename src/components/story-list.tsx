import { StoryCard } from "@/components/story-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DisplayLanguage, StorySummary } from "@/types/api";

export function StoryList({
  stories,
  displayLanguage,
  emptyTitle = "No stories found",
  emptyMessage = "Grouped multi-publisher stories will appear here when reporting activity is detected.",
}: {
  stories: StorySummary[];
  displayLanguage?: DisplayLanguage;
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  if (stories.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} displayLanguage={displayLanguage} />
      ))}
    </div>
  );
}
