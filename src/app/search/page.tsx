import Link from "next/link";
import { ErrorState } from "@/components/error-state";
import { SearchResults } from "@/components/search-results";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { getApiErrorMessage } from "@/lib/api/errors";
import { searchArticles, searchArticlesSemantically } from "@/lib/api/search";
import { formatCategory } from "@/lib/format";
import { readDisplayLanguage } from "@/lib/language";
import { buildSearchHref, readSearchMode, type SearchMode } from "@/lib/search-state";
import { ARTICLE_CATEGORIES, type ArticleCategory, type Language } from "@/types/api";
import { Search, TextSearch, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParameters {
  q?: string | string[];
  mode?: string | string[];
  page?: string | string[];
  source?: string | string[];
  category?: string | string[];
  language?: string | string[];
  lang?: string | string[];
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function category(value: string | undefined): ArticleCategory | undefined {
  return ARTICLE_CATEGORIES.includes(value as ArticleCategory)
    ? value as ArticleCategory
    : undefined;
}

function originalLanguage(value: string | undefined): Language | undefined {
  return value === "en" || value === "si" || value === "ta" ? value : undefined;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParameters>;
}) {
  const parameters = await searchParams;
  const displayLanguage = readDisplayLanguage(parameters.lang);
  const query = (first(parameters.q) ?? "").normalize("NFC").trim().replace(/\s+/gu, " ");
  const mode = readSearchMode(first(parameters.mode));
  const source = first(parameters.source);
  const selectedCategory = category(first(parameters.category));
  const selectedLanguage = originalLanguage(first(parameters.language));
  const requestedPage = Number.parseInt(first(parameters.page) ?? "0", 10);
  const page = Number.isFinite(requestedPage) && requestedPage >= 0 ? requestedPage : 0;

  const hrefFor = (nextMode: SearchMode, nextPage?: number) => {
    return buildSearchHref({ query, mode: nextMode, page: nextPage, source,
      category: selectedCategory, language: selectedLanguage, displayLanguage });
  };

  const modeSelector = (
    <nav aria-label="Search mode" className="flex flex-wrap gap-3">
      <Link href={hrefFor("text")} aria-current={mode === "text" ? "page" : undefined} className={`flex h-full items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${mode === "text" ? "border-brand bg-brand-soft/20 text-brand outline-2 outline-offset-2 outline-brand" : "border-border bg-surface hover:border-border-strong"}`}>
        <div className={`mt-0.5 rounded-lg p-1.5 ${mode === "text" ? "bg-brand text-white" : "bg-surface-muted text-foreground-secondary"}`}>
          <TextSearch className="size-4" />
        </div>
        <div>
          <span className={`block text-sm font-bold ${mode === "text" ? "text-brand" : "text-foreground"}`}>Keyword</span>
          <span className="text-xs text-foreground-secondary">Search exact words</span>
        </div>
      </Link>
      <Link href={hrefFor("semantic")} aria-current={mode === "semantic" ? "page" : undefined} className={`flex h-full items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${mode === "semantic" ? "border-brand bg-brand-soft/20 text-brand outline-2 outline-offset-2 outline-brand" : "border-border bg-surface hover:border-border-strong"}`}>
        <div className={`mt-0.5 rounded-lg p-1.5 ${mode === "semantic" ? "bg-brand text-white" : "bg-surface-muted text-foreground-secondary"}`}>
          <Sparkles className="size-4" />
        </div>
        <div>
          <span className={`block text-sm font-bold ${mode === "semantic" ? "text-brand" : "text-foreground"}`}>Semantic</span>
          <span className="text-xs text-foreground-secondary">Search by meaning</span>
        </div>
      </Link>
    </nav>
  );

  const form = (
    <Surface variant="elevated" className="p-5">
      <form action="/search" method="get" className="grid gap-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <label htmlFor="search-query" className="sr-only">Search news</label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="size-5 text-foreground-secondary" />
          </div>
          <input id="search-query" name="q" type="search" required minLength={2} maxLength={200} defaultValue={query} placeholder="Search news..." className="w-full rounded-lg border border-border-strong bg-surface px-10 py-2.5 text-sm text-foreground focus:outline-2 focus:outline-brand placeholder:text-foreground-muted" />
        </div>
        <div>
          <label htmlFor="search-category" className="sr-only">Category</label>
          <select id="search-category" name="category" defaultValue={selectedCategory ?? ""} className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground focus:outline-2 focus:outline-brand cursor-pointer">
            <option value="">All categories</option>
            {ARTICLE_CATEGORIES.map((item) => <option key={item} value={item}>{formatCategory(item)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="search-language" className="sr-only">Original language</label>
          <select id="search-language" name="language" defaultValue={selectedLanguage ?? ""} className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground focus:outline-2 focus:outline-brand cursor-pointer">
            <option value="">All languages</option>
            <option value="en">English original</option>
            <option value="si">Sinhala original</option>
            <option value="ta">Tamil original</option>
          </select>
        </div>
        <input type="hidden" name="mode" value={mode} />
        {source ? <input type="hidden" name="source" value={source} /> : null}
        {displayLanguage ? <input type="hidden" name="lang" value={displayLanguage} /> : null}
        <button type="submit" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground hover:bg-brand-hover transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-brand shrink-0">Search</button>
      </form>
    </Surface>
  );

  const searchControls = (
    <div className="space-y-6">
      {modeSelector}
      {form}
      {mode === "semantic" ? <p className="text-sm text-foreground-secondary">Results are ordered by conceptual similarity. Raw similarity scores are not shown.</p> : null}
    </div>
  );

  if (!query) {
    return (
      <section className="space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          eyebrow="Public news search" 
          title="Search" 
          description="Search public reporting by exact words or conceptual meaning."
          filterSlot={searchControls}
        />
      </section>
    );
  }

  let results: Awaited<ReturnType<typeof searchArticles>> | Awaited<ReturnType<typeof searchArticlesSemantically>> | undefined;
  let loadError: unknown;
  try {
    const options = { query, page, source, category: selectedCategory,
      language: selectedLanguage, displayLanguage };
    results = mode === "semantic"
      ? await searchArticlesSemantically(options)
      : await searchArticles(options);
  } catch (error) {
    loadError = error;
  }

  if (!results) {
    const message = mode === "semantic"
      ? "Semantic search is temporarily unavailable. Try Keyword search."
      : getApiErrorMessage(loadError);
    return (
      <section className="space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader eyebrow="Public news search" title="Search" filterSlot={searchControls} />
        <ErrorState message={message} />
        {mode === "semantic" ? (
          <Link href={hrefFor("text")} className="inline-flex font-semibold text-brand hover:underline">
            Try Keyword search
          </Link>
        ) : null}
      </section>
    );
  }

  const hasMore = "hasMore" in results ? results.hasMore : !results.last;
  
  return (
    <section className="space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader 
        eyebrow="Public news search" 
        title={`Search results for "${results.query}"`} 
        filterSlot={searchControls} 
      />
      
      <SearchResults 
        query={results.query} 
        articles={results.content} 
        displayLanguage={displayLanguage} 
        mode={mode} 
        keywordHref={hrefFor("text")} 
      />
      
      {(page > 0 || hasMore) && (
        <nav aria-label="Search result pages" className="flex items-center justify-between border-t border-border pt-6">
          {results.first || page === 0 ? <span /> : (
            <Link href={hrefFor(mode, page - 1)} className="inline-flex items-center justify-center font-bold text-sm text-foreground hover:text-brand transition-colors">
              &larr; Previous Page
            </Link>
          )}
          {hasMore ? (
            <Link href={hrefFor(mode, page + 1)} className="inline-flex items-center justify-center font-bold text-sm text-foreground hover:text-brand transition-colors">
              Next Page &rarr;
            </Link>
          ) : null}
        </nav>
      )}
    </section>
  );
}
