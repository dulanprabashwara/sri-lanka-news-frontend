import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { withDisplayLanguage } from "@/lib/language";
import type { Article, DisplayLanguage } from "@/types/api";

export function SearchResults({ query, articles, displayLanguage, mode = "text", keywordHref }: {
  query: string;
  articles: Article[];
  displayLanguage?: DisplayLanguage;
  mode?: "text" | "semantic";
  keywordHref?: string;
}) {
  if (articles.length === 0) {
    return <div className="state-panel" role="status">
      <h2 className="text-lg font-bold text-slate-900">{mode === "semantic" ? "No semantically related reports found." : <>No results found for &quot;{query}&quot;</>}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{mode === "semantic" ? "Try exact words with Keyword search or remove a filter." : "Try different words, remove a filter, or browse the latest reporting."}</p>
      {mode === "semantic" && keywordHref
        ? <Link href={keywordHref} className="mt-4 inline-flex font-semibold text-teal-800 hover:underline">Try Keyword search</Link>
        : <Link href={withDisplayLanguage("/", displayLanguage)} className="mt-4 inline-flex font-semibold text-teal-800 hover:underline">Browse Latest news</Link>}
    </div>;
  }
  return <div className="grid gap-5">{articles.map((article) =>
    <ArticleCard key={article.id} article={article} displayLanguage={displayLanguage} />
  )}</div>;
}
