import Link from "next/link";
import { ArticleFeed } from "@/components/article-feed";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryNavigation } from "@/components/category-navigation";
import { ErrorState } from "@/components/error-state";
import { getArticles } from "@/lib/api/news";
import { getApiErrorMessage } from "@/lib/api/errors";
import { archivePage, archiveHref } from "@/lib/archive";
import { readDisplayLanguage } from "@/lib/language";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata = { title: "All articles" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const page = archivePage(params.page);
  const lang = readDisplayLanguage(params.lang);
  const source = typeof params.source === "string" ? params.source : undefined;
  const category = ARTICLE_CATEGORIES.includes(params.category as ArticleCategory) ? params.category as ArticleCategory : undefined;
  let articles;
  try { articles = await getArticles({ page, size: 20, source, category, displayLanguage: lang, sort: "publishedAt,desc" }); }
  catch (error) { return <ErrorState title="Unable to load the archive" message={getApiErrorMessage(error)} />; }
  const filters = { lang, source, category };
  return <div className="space-y-8">
    <PageHeader eyebrow="The publisher archive" title="Every report, in one place." description="Browse the complete available article index, newest first. Open any report for its metadata and original publisher link." filterSlot={<CategoryNavigation activeCategory={category} basePath="/articles" label="Article categories" displayLanguage={lang} />} />
    <div className="flex justify-between border-b border-border pb-4 text-sm text-foreground-secondary"><span>{articles.totalElements.toLocaleString()} available reports</span><span>{articles.totalPages ? `Page ${articles.page + 1} of ${articles.totalPages}` : "No results"}</span></div>
    <ArticleFeed articles={articles.content} displayLanguage={lang} emptyTitle="No reports on this page" emptyMessage="Return to the first page to browse available reports." />
    <nav aria-label="Article archive pagination" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 text-sm font-semibold shadow-xs sm:p-5">
      {page > 0 ? <Link href={archiveHref(page - 1, filters)} className="rounded-lg border border-border px-4 py-2 text-foreground-secondary hover:border-brand hover:text-brand">← Previous</Link> : <span className="rounded-lg bg-surface-muted px-4 py-2 text-foreground-muted">First page</span>}
      <span className="text-xs text-foreground-muted" aria-current="page">Page {articles.page + 1}</span>
      {!articles.last ? <Link href={archiveHref(page + 1, filters)} className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-hover">Next page →</Link> : <span className="rounded-lg bg-surface-muted px-4 py-2 text-foreground-muted">Last page</span>}
    </nav>
  </div>;
}
