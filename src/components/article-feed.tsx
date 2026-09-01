import { ArticleCard } from "@/components/article-card";
import type { Article, DisplayLanguage } from "@/types/api";

interface ArticleFeedProps {
  articles: Article[];
  emptyTitle?: string;
  emptyMessage?: string;
  displayLanguage?: DisplayLanguage;
}

export function ArticleFeed({
  articles,
  emptyTitle = "No articles yet",
  emptyMessage = "New articles will appear here when they are available.",
  displayLanguage,
}: ArticleFeedProps) {
  if (articles.length === 0) {
    return (
      <div className="state-panel" role="status">
        <h2 className="text-lg font-bold text-slate-900">{emptyTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:gap-5">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} displayLanguage={displayLanguage} />
      ))}
    </div>
  );
}
