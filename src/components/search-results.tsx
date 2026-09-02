import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { withDisplayLanguage } from "@/lib/language";
import type { Article, DisplayLanguage } from "@/types/api";

export function SearchResults({ query, articles, displayLanguage }: {
  query: string;
  articles: Article[];
  displayLanguage?: DisplayLanguage;
}) {
  if (articles.length === 0) {
    return <div className="state-panel" role="status">
      <h2 className="text-lg font-bold text-slate-900">No results found for &quot;{query}&quot;</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Try different words, remove a filter, or browse the latest reporting.</p>
      <Link href={withDisplayLanguage("/", displayLanguage)} className="mt-4 inline-flex font-semibold text-teal-800 hover:underline">Browse Latest news</Link>
    </div>;
  }
  return <div className="grid gap-5">{articles.map((article) =>
    <ArticleCard key={article.id} article={article} displayLanguage={displayLanguage} />
  )}</div>;
}
