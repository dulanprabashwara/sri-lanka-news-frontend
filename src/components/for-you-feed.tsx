import { ArticleCard } from "@/components/article-card";
import { formatCategory } from "@/lib/format";
import type { ArticleCategory, DisplayLanguage, ForYouItem, RecommendationReason } from "@/types/api";

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
    return <div className="state-panel" role="status"><h2 className="text-lg font-bold text-slate-900">No articles yet</h2><p className="mt-2 text-sm leading-6 text-slate-600">Recent articles will appear here when they are available.</p></div>;
  }
  return <div className="grid gap-5">{items.map((item) => (
    <div key={item.article.id}>
      {item.personalized && item.reasons.length > 0 ? <ul aria-label="Why this article" className="mb-2 flex flex-wrap gap-2">
        {item.reasons.slice(0, 3).map((reason) => <li key={`${reason.type}:${reason.label}`} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">{reasonLabel(reason)}</li>)}
      </ul> : null}
      <ArticleCard article={item.article} displayLanguage={displayLanguage} />
    </div>
  ))}</div>;
}
