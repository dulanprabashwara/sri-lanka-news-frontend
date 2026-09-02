import Link from "next/link";
import { ErrorState } from "@/components/error-state";
import { SearchResults } from "@/components/search-results";
import { getApiErrorMessage } from "@/lib/api/errors";
import { searchArticles } from "@/lib/api/search";
import { formatCategory } from "@/lib/format";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import { ARTICLE_CATEGORIES, type ArticleCategory, type Language } from "@/types/api";

export const dynamic = "force-dynamic";

interface SearchParameters {
  q?: string | string[];
  page?: string | string[];
  category?: string | string[];
  language?: string | string[];
  lang?: string | string[];
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function category(value: string | undefined): ArticleCategory | undefined {
  return ARTICLE_CATEGORIES.includes(value as ArticleCategory) ? value as ArticleCategory : undefined;
}

function originalLanguage(value: string | undefined): Language | undefined {
  return value === "en" || value === "si" || value === "ta" ? value : undefined;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParameters> }) {
  const parameters = await searchParams;
  const displayLanguage = readDisplayLanguage(parameters.lang);
  const rawQuery = first(parameters.q) ?? "";
  const query = rawQuery.normalize("NFC").trim().replace(/\s+/gu, " ");
  const selectedCategory = category(first(parameters.category));
  const selectedLanguage = originalLanguage(first(parameters.language));
  const requestedPage = Number.parseInt(first(parameters.page) ?? "0", 10);
  const page = Number.isFinite(requestedPage) && requestedPage >= 0 ? requestedPage : 0;

  const form = <form action="/search" method="get" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto_auto_auto]">
    <div><label htmlFor="search-query" className="sr-only">Search news</label><input id="search-query" name="q" type="search" required minLength={2} maxLength={200} defaultValue={query} placeholder="Search news" className="w-full rounded-lg border border-slate-300 px-4 py-2.5" /></div>
    <div><label htmlFor="search-category" className="sr-only">Category</label><select id="search-category" name="category" defaultValue={selectedCategory ?? ""} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">All categories</option>{ARTICLE_CATEGORIES.map((item) => <option key={item} value={item}>{formatCategory(item)}</option>)}</select></div>
    <div><label htmlFor="search-language" className="sr-only">Original language</label><select id="search-language" name="language" defaultValue={selectedLanguage ?? ""} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">All languages</option><option value="en">English original</option><option value="si">Sinhala original</option><option value="ta">Tamil original</option></select></div>
    {displayLanguage ? <input type="hidden" name="lang" value={displayLanguage} /> : null}
    <button type="submit" className="rounded-lg bg-teal-800 px-5 py-2.5 font-bold text-white hover:bg-teal-700">Search</button>
  </form>;

  if (!query) return <section className="space-y-8"><header className="max-w-3xl"><p className="eyebrow">Public news search</p><h1 className="page-title">Search</h1><p className="page-intro">Search public headlines, summaries, topics, and available translations.</p></header>{form}</section>;

  let results: Awaited<ReturnType<typeof searchArticles>> | undefined;
  let loadError: unknown;
  try {
    results = await searchArticles({ query, page, category: selectedCategory,
      language: selectedLanguage, displayLanguage });
  } catch (error) {
    loadError = error;
  }

  if (!results) {
    return <section className="space-y-8"><header><p className="eyebrow">Public news search</p><h1 className="page-title">Search</h1></header>{form}<ErrorState message={getApiErrorMessage(loadError)} /></section>;
  }

  const pageHref = (nextPage: number) => {
    const next = new URLSearchParams({ q: results.query });
    if (nextPage > 0) next.set("page", String(nextPage));
    if (selectedCategory) next.set("category", selectedCategory);
    if (selectedLanguage) next.set("language", selectedLanguage);
    return withDisplayLanguage(`/search?${next}`, displayLanguage);
  };
  return <section className="space-y-8"><header><p className="eyebrow">Public news search</p><h1 className="page-title">Search results for &quot;{results.query}&quot;</h1></header>{form}<SearchResults query={results.query} articles={results.content} displayLanguage={displayLanguage} /><nav aria-label="Search result pages" className="flex justify-between">{results.first ? <span /> : <Link href={pageHref(page - 1)} className="font-semibold text-teal-800">Previous</Link>}{results.last ? null : <Link href={pageHref(page + 1)} className="font-semibold text-teal-800">Next</Link>}</nav></section>;
}
