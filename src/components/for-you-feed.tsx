import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCategory } from "@/lib/format";
import type { ArticleCategory, DisplayLanguage, ForYouItem, RecommendationReason } from "@/types/api";
import { Newspaper } from "lucide-react";

function reasonLabel(reason: RecommendationReason) {
  if (reason.type === "FOLLOWED_SOURCE") return `Because you follow ${reason.label}`;
  if (reason.type === "FOLLOWED_TOPIC") return `Topic: ${reason.label}`;
  return `Preferred category: ${formatCategory(reason.label as ArticleCategory)}`;
}

export function ForYouFeed({ items, displayLanguage }: {
  items: ForYouItem[];
  displayLanguage?: DisplayLanguage;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Newspaper className="size-6 text-foreground-secondary" />}
        title="No articles yet"
        description="Recent articles will appear here when they are available."
      />
    );
  }
  return <div className="grid gap-5">{items.map((item) => (
    <div key={item.article.id}>
      {item.personalized && item.reasons.length > 0 ? <ul aria-label="Why this article" className="mb-3 flex flex-wrap gap-2">
        {item.reasons.slice(0, 3).map((reason) => <li key={`${reason.type}:${reason.label}`} className="rounded-full bg-surface-muted border border-border px-3 py-1 text-xs font-semibold text-foreground-secondary">{reasonLabel(reason)}</li>)}
      </ul> : null}
      <ArticleCard article={item.article} displayLanguage={displayLanguage} />
    </div>
  ))}</div>;
}
