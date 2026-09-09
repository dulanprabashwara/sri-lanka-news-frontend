import Link from "next/link";
import { ErrorState } from "@/components/error-state";
import { SearchResults } from "@/components/search-results";
import { Surface } from "@/components/ui/surface";
import { getApiErrorMessage } from "@/lib/api/errors";
import { searchArticles, searchArticlesSemantically } from "@/lib/api/search";
import { formatCategory } from "@/lib/format";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import { buildSearchHref, readSearchMode, type SearchMode } from "@/lib/search-state";
import { ARTICLE_CATEGORIES, type ArticleCategory, type Language } from "@/types/api";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Search,
  SlidersHorizontal,
  Sparkles,
  TextSearch,
} from "lucide-react";

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
    <nav aria-label="Search mode" className="grid gap-2 sm:grid-cols-2">
      <Link href={hrefFor("text")} aria-current={mode === "text" ? "page" : undefined} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${mode === "text" ? "border-blue-400 bg-white text-foreground shadow-sm" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}>
        <div className={`rounded-md p-1.5 ${mode === "text" ? "bg-brand text-white" : "bg-white/10 text-slate-300"}`}>
          <TextSearch className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span className={`block text-sm font-bold ${mode === "text" ? "text-foreground" : "text-white"}`}>Keyword search</span>
          <span className={`block text-xs ${mode === "text" ? "text-foreground-secondary" : "text-slate-400"}`}>Best for names, places, and exact phrases</span>
        </div>
        {mode === "text" ? <CheckCircle2 className="size-4 shrink-0 text-brand" aria-hidden="true" /> : null}
      </Link>
      <Link href={hrefFor("semantic")} aria-current={mode === "semantic" ? "page" : undefined} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${mode === "semantic" ? "border-blue-400 bg-white text-foreground shadow-sm" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}>
        <div className={`rounded-md p-1.5 ${mode === "semantic" ? "bg-brand text-white" : "bg-white/10 text-slate-300"}`}>
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span className={`block text-sm font-bold ${mode === "semantic" ? "text-foreground" : "text-white"}`}>Meaning search</span>
          <span className={`block text-xs ${mode === "semantic" ? "text-foreground-secondary" : "text-slate-400"}`}>Best for topics, questions, and related ideas</span>
        </div>
        {mode === "semantic" ? <CheckCircle2 className="size-4 shrink-0 text-brand" aria-hidden="true" /> : null}
      </Link>
    </nav>
  );

  const form = (
    <form action="/search" method="get" className="rounded-xl bg-white p-3 shadow-xl shadow-black/10 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="search-query" className="sr-only">Search news</label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="size-5 text-foreground-secondary" />
          </div>
          <input id="search-query" name="q" type="search" required minLength={2} maxLength={200} defaultValue={query} placeholder="Search a person, place, event, or idea" className="min-h-12 w-full rounded-lg border border-border-strong bg-surface py-3 pl-11 pr-4 text-base text-foreground placeholder:text-foreground-muted focus:outline-2 focus:outline-brand" />
        </div>
        <button type="submit" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover focus:outline-2 focus:outline-offset-2 focus:outline-brand">
          Search reports
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-foreground-muted" aria-hidden="true" />
          <label htmlFor="search-category" className="sr-only">Category</label>
          <select id="search-category" name="category" defaultValue={selectedCategory ?? ""} className="w-full cursor-pointer rounded-lg border border-border bg-surface-muted py-2 pl-9 pr-3 text-xs font-semibold text-foreground focus:outline-2 focus:outline-brand">
            <option value="">All categories</option>
            {ARTICLE_CATEGORIES.map((item) => <option key={item} value={item}>{formatCategory(item)}</option>)}
          </select>
        </div>
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-foreground-muted" aria-hidden="true" />
          <label htmlFor="search-language" className="sr-only">Original language</label>
          <select id="search-language" name="language" defaultValue={selectedLanguage ?? ""} className="w-full cursor-pointer rounded-lg border border-border bg-surface-muted py-2 pl-9 pr-3 text-xs font-semibold text-foreground focus:outline-2 focus:outline-brand">
            <option value="">All languages</option>
            <option value="en">English original</option>
            <option value="si">Sinhala original</option>
            <option value="ta">Tamil original</option>
          </select>
        </div>
      </div>
      <input type="hidden" name="mode" value={mode} />
      {source ? <input type="hidden" name="source" value={source} /> : null}
      {displayLanguage ? <input type="hidden" name="lang" value={displayLanguage} /> : null}
    </form>
  );

  const searchControls = (
    <div className="space-y-4">
      {form}
      <div>
        <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-400">Choose a search method</p>
        {modeSelector}
      </div>
    </div>
  );

  const searchHeader = (
    <header className="relative isolate overflow-hidden rounded-2xl bg-foreground px-5 py-7 text-white shadow-lg sm:px-8 sm:py-9 lg:px-10">
      <div className="absolute -right-24 -top-36 -z-10 size-96 rounded-full bg-brand/25 blur-2xl" aria-hidden="true" />
      <div className="max-w-3xl">
        <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-blue-300">
          <FileSearch className="size-4" aria-hidden="true" />
          News archive
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Find the reporting that matters.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Search reporting from across Sri Lankan publishers by exact wording or by the meaning behind your question.</p>
      </div>
      <div className="mt-7 max-w-4xl">{searchControls}</div>
    </header>
  );

  if (!query) {
    return (
      <section className="space-y-8">
        {searchHeader}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Surface variant="elevated" className="p-6 sm:p-7">
            <p className="eyebrow">A better starting point</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">Search with a clear subject</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">Use a name, location, policy, election, match, or public issue. Add a category or original language only when you need to narrow the newsroom archive.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Person or organisation", "Place or public event", "Topic or question"].map((label, index) => (
                <div key={label} className="rounded-lg border border-border bg-surface-muted px-4 py-3">
                  <span className="text-[0.65rem] font-bold text-brand">0{index + 1}</span>
                  <p className="mt-1 text-xs font-semibold text-foreground">{label}</p>
                </div>
              ))}
            </div>
          </Surface>
          <Surface variant="highlight" className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Browse instead</p>
            <div className="mt-4 divide-y divide-brand-soft">
              {[
                ["Latest reports", "/articles"],
                ["Trending stories", "/trending"],
                ["Publisher directory", "/sources"],
              ].map(([label, href]) => (
                <Link key={href} href={withDisplayLanguage(href, displayLanguage)} className="flex items-center justify-between py-3 text-sm font-bold text-foreground transition-colors hover:text-brand">
                  {label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </Surface>
        </div>
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
      <section className="space-y-8">
        {searchHeader}
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
    <section className="space-y-8">
      {searchHeader}
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10">
        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Search results</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">Reporting on “{results.query}”</h2>
            </div>
            <p className="text-xs font-semibold text-foreground-muted">Page {page + 1} · {mode === "semantic" ? "Meaning search" : "Keyword search"}</p>
          </div>
          <SearchResults
            query={results.query}
            articles={results.content}
            displayLanguage={displayLanguage}
            mode={mode}
            keywordHref={hrefFor("text")}
          />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-28">
          <Surface variant="elevated" className="p-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand">Current search</p>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between gap-3"><dt className="text-foreground-muted">Method</dt><dd className="font-bold text-foreground">{mode === "semantic" ? "Meaning" : "Keyword"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-foreground-muted">Category</dt><dd className="font-bold text-foreground">{selectedCategory ? formatCategory(selectedCategory) : "All"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-foreground-muted">Language</dt><dd className="font-bold text-foreground uppercase">{selectedLanguage ?? "All"}</dd></div>
            </dl>
          </Surface>
          {mode === "semantic" ? (
            <Surface variant="highlight" className="p-5">
              <Sparkles className="size-5 text-brand" aria-hidden="true" />
              <p className="mt-3 text-sm font-bold text-foreground">How meaning search works</p>
              <p className="mt-1 text-xs leading-5 text-foreground-secondary">Results are ordered by conceptual similarity. Raw similarity scores remain hidden.</p>
            </Surface>
          ) : null}
        </aside>
      </div>
      
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
