import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/ui/empty-state";
import { withDisplayLanguage } from "@/lib/language";
import type { Article, DisplayLanguage } from "@/types/api";
import { SearchX, FileSearch } from "lucide-react";

export function SearchResults({ query, articles, displayLanguage, mode = "text", keywordHref }: {
  query: string;
  articles: Article[];
  displayLanguage?: DisplayLanguage;
  mode?: "text" | "semantic";
  keywordHref?: string;
}) {
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-6 text-foreground-secondary" />}
        title={mode === "semantic" ? "No semantically related reports found" : `No results found for "${query}"`}
        description={mode === "semantic" ? "Try exact words with Keyword search or remove a filter." : "Try different words, remove a filter, or browse the latest reporting."}
        primaryAction={mode === "semantic" && keywordHref ? (
          <Link href={keywordHref} className="inline-flex items-center justify-center font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150">
            <FileSearch className="size-4" />
            Keyword Search
          </Link>
        ) : (
          <Link href={withDisplayLanguage("/", displayLanguage)} className="inline-flex items-center justify-center font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150">
            Browse Latest News
          </Link>
        )}
      />
    );
  }
  return <div className="grid gap-5">{articles.map((article) =>
    <ArticleCard key={article.id} article={article} displayLanguage={displayLanguage} />
  )}</div>;
}
