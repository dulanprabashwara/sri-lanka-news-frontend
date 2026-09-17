import type { Metadata } from "next";
import Link from "next/link";
import { SourceIcon } from "@/components/source-icon";
import { archiveHref } from "@/lib/archive";
import { notFound } from "next/navigation";
import { ArticleFeed } from "@/components/article-feed";
import { ErrorState } from "@/components/error-state";
import { FollowButton } from "@/components/follow-button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getArticles, getSource } from "@/lib/api/news";
import { getSourceFollowStatus } from "@/lib/api/user";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import { formatLanguage } from "@/lib/format";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";

import type { Source, Language } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "News source" };

const SLUG_CANDIDATES: Record<string, string[]> = {
  "dailymirror": ["daily-mirror", "dailymirror"],
  "daily-mirror": ["daily-mirror", "dailymirror"],
  "newswire": ["newswire"],
  "hiru-news": ["hiru-news-sinhala", "hiru-news"],
  "hiru-news-sinhala": ["hiru-news-sinhala", "hiru-news"],
  "lankadeepa": ["lankadeepa"],
  "divaina": ["divaina"],
  "the-island": ["the-island", "island"],
  "newsfirst": ["newsfirst"],
};

const STATIC_SOURCES: Record<string, Source> = {
  "dailymirror": { name: "Daily Mirror", slug: "daily-mirror", baseUrl: "https://www.dailymirror.lk", defaultLanguage: "EN" as Language },
  "daily-mirror": { name: "Daily Mirror", slug: "daily-mirror", baseUrl: "https://www.dailymirror.lk", defaultLanguage: "EN" as Language },
  "newswire": { name: "Newswire", slug: "newswire", baseUrl: "https://www.newswire.lk", defaultLanguage: "EN" as Language },
  "hiru-news": { name: "Hiru News", slug: "hiru-news-sinhala", baseUrl: "https://www.hirunews.lk", defaultLanguage: "SI" as Language },
  "hiru-news-sinhala": { name: "Hiru News", slug: "hiru-news-sinhala", baseUrl: "https://www.hirunews.lk", defaultLanguage: "SI" as Language },
  "lakbima-news": { name: "Lakbima News", slug: "lakbima-news", baseUrl: "https://lakbima.news", defaultLanguage: "SI" as Language },
  "lankadeepa": { name: "Lankadeepa", slug: "lankadeepa", baseUrl: "https://www.lankadeepa.lk", defaultLanguage: "SI" as Language },
  "divaina": { name: "Divaina", slug: "divaina", baseUrl: "https://divaina.lk", defaultLanguage: "SI" as Language },
  "the-island": { name: "The Island", slug: "the-island", baseUrl: "https://island.lk", defaultLanguage: "EN" as Language },
  "newsfirst": { name: "News First", slug: "newsfirst", baseUrl: "https://www.newsfirst.lk", defaultLanguage: "EN" as Language },
};

export default async function SourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { slug } = await params;
  const displayLanguage = readDisplayLanguage((await searchParams).lang);
  const currentPath = withDisplayLanguage(`/source/${encodeURIComponent(slug)}`, displayLanguage);
  const accessToken = await getAuthenticatedAccessToken();

  const candidates = SLUG_CANDIDATES[slug.toLowerCase()] ?? [slug];
  let source: Source | undefined;

  for (const cand of candidates) {
    try {
      source = await getSource(cand);
      if (source) break;
    } catch {
      /* Try next candidate slug */
    }
  }

  if (!source) {
    source = STATIC_SOURCES[slug.toLowerCase()] ?? STATIC_SOURCES[candidates[0]];
  }

  if (!source) {
    notFound();
  }

  let followed = false;
  if (accessToken) {
    try { followed = (await getSourceFollowStatus(accessToken, source.slug)).followed; } catch { /* Follow status is non-critical. */ }
  }

  const allCandidates = Array.from(new Set([
    source.slug,
    ...candidates,
    slug,
  ]));

  let articles;
  let articleError: unknown;

  // 1. Try with displayLanguage and candidate slugs
  for (const cand of allCandidates) {
    try {
      const res = await getArticles({
        page: 0,
        size: 20,
        source: cand,
        sort: "publishedAt,desc",
        displayLanguage,
      });
      if (res && res.content.length > 0) {
        articles = res;
        articleError = undefined;
        break;
      }
    } catch (error) {
      articleError = error;
    }
  }

  // Fallback: query recent global articles and filter by source matching.
  if (!articles || articles.content.length === 0) {
    try {
      const globalArticles = await getArticles({ page: 0, size: 50, sort: "publishedAt,desc", displayLanguage });
      if (globalArticles && globalArticles.content.length > 0) {
        const matching = globalArticles.content.filter(a =>
          allCandidates.includes(a.source.slug) ||
          a.source.name.toLowerCase().includes(source.name.toLowerCase()) ||
          source.name.toLowerCase().includes(a.source.name.toLowerCase())
        );
        if (matching.length > 0) {
          articles = { ...globalArticles, content: matching };
          articleError = undefined;
        }
      }
    } catch {
      /* Keep previous state */
    }
  }

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-border border-t-4 border-t-brand bg-surface p-6 shadow-xs sm:p-8">
        <p className="eyebrow">News source</p>
        <h1 className="mt-3 flex items-center gap-5 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          <span>{source.name}</span>
          <SourceIcon name={source.name} baseUrl={source.baseUrl} slug={slug} size="2xl" rounded="full" />
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Default language: {formatLanguage(source.defaultLanguage)}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <FollowButton type="SOURCE" target={source.slug} initialFollowed={followed} authenticated={Boolean(accessToken)} path={currentPath} />
          <a
            href={source.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Visit publisher
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </a>
        </div>
      </header>
      <section aria-labelledby="source-articles-title">
        <h2
          id="source-articles-title"
          className="mb-5 text-2xl font-extrabold tracking-tight text-slate-950"
        >
          Latest articles
        </h2>
        {articleError && !articles ? (
          <ErrorState message={getApiErrorMessage(articleError)} />
        ) : (
          <ArticleFeed
            articles={articles?.content ?? []}
            displayLanguage={displayLanguage}
            emptyTitle="No articles from this source"
            emptyMessage="Articles will appear here when they are available."
          />
        )}
      </section>
      <Link href={archiveHref(0, { source: source.slug, lang: displayLanguage })} className="inline-flex rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-hover">View all articles from {source.name} →</Link>
    </div>
  );
}
