import Link from "next/link";
import { ErrorState } from "@/components/error-state";
import { SearchResults } from "@/components/search-results";
import { getApiErrorMessage } from "@/lib/api/errors";
import { searchArticles, searchArticlesSemantically } from "@/lib/api/search";
import { formatCategory } from "@/lib/format";
import { readDisplayLanguage } from "@/lib/language";
import { buildSearchHref, readSearchMode, type SearchMode } from "@/lib/search-state";
import { ARTICLE_CATEGORIES, type ArticleCategory, type Language } from "@/types/api";

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

  const modeSelector = <nav aria-label="Search mode" className="flex flex-wrap gap-3">
    <Link href={hrefFor("text")} aria-current={mode === "text" ? "page" : undefined} className={`rounded-xl border px-4 py-3 ${mode === "text" ? "border-teal-800 bg-teal-50" : "border-slate-200 bg-white"}`}>
      <span className="block font-bold text-slate-900">Keyword</span>
      <span className="text-sm text-slate-600">Search exact words</span>
    </Link>
    <Link href={hrefFor("semantic")} aria-current={mode === "semantic" ? "page" : undefined} className={`rounded-xl border px-4 py-3 ${mode === "semantic" ? "border-teal-800 bg-teal-50" : "border-slate-200 bg-white"}`}>
      <span className="block font-bold text-slate-900">Semantic</span>
      <span className="text-sm text-slate-600">Search by meaning</span>
    </Link>
  </nav>;

  const form = <form action="/search" method="get" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto_auto_auto]">
    <div><label htmlFor="search-query" className="sr-only">Search news</label><input id="search-query" name="q" type="search" required minLength={2} maxLength={200} defaultValue={query} placeholder="Search news" className="w-full rounded-lg border border-slate-300 px-4 py-2.5" /></div>
    <div><label htmlFor="search-category" className="sr-only">Category</label><select id="search-category" name="category" defaultValue={selectedCategory ?? ""} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">All categories</option>{ARTICLE_CATEGORIES.map((item) => <option key={item} value={item}>{formatCategory(item)}</option>)}</select></div>
    <div><label htmlFor="search-language" className="sr-only">Original language</label><select id="search-language" name="language" defaultValue={selectedLanguage ?? ""} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">All languages</option><option value="en">English original</option><option value="si">Sinhala original</option><option value="ta">Tamil original</option></select></div>
    <input type="hidden" name="mode" value={mode} />
    {source ? <input type="hidden" name="source" value={source} /> : null}
    {displayLanguage ? <input type="hidden" name="lang" value={displayLanguage} /> : null}
    <button type="submit" className="rounded-lg bg-teal-800 px-5 py-2.5 font-bold text-white hover:bg-teal-700">Search</button>
  </form>;

  if (!query) {
    return <section className="space-y-8">
      <header className="max-w-3xl"><p className="eyebrow">Public news search</p><h1 className="page-title">Search</h1><p className="page-intro">Search public reporting by exact words or conceptual meaning.</p></header>
      {modeSelector}{form}
      {mode === "semantic" ? <p className="text-sm text-slate-600">Semantic search finds reports with similar meaning even when they use different words.</p> : null}
    </section>;
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
    return <section className="space-y-8">
      <header><p className="eyebrow">Public news search</p><h1 className="page-title">Search</h1></header>
      {modeSelector}{form}<ErrorState message={message} />
      {mode === "semantic" ? <Link href={hrefFor("text")} className="font-semibold text-teal-800 hover:underline">Try Keyword search</Link> : null}
    </section>;
  }

  const hasMore = "hasMore" in results ? results.hasMore : !results.last;
  return <section className="space-y-8">
    <header><p className="eyebrow">Public news search</p><h1 className="page-title">Search results for &quot;{results.query}&quot;</h1></header>
    {modeSelector}{form}
    {mode === "semantic" ? <p className="text-sm text-slate-600">Results are ordered by conceptual similarity. Raw similarity scores are not shown.</p> : null}
    <SearchResults query={results.query} articles={results.content} displayLanguage={displayLanguage} mode={mode} keywordHref={hrefFor("text")} />
    <nav aria-label="Search result pages" className="flex justify-between">
      {results.first ? <span /> : <Link href={hrefFor(mode, page - 1)} className="font-semibold text-teal-800">Previous</Link>}
      {hasMore ? <Link href={hrefFor(mode, page + 1)} className="font-semibold text-teal-800">Next</Link> : null}
    </nav>
  </section>;
}
