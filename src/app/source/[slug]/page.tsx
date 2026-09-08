import type { Metadata } from "next";
import Link from "next/link";
import { SourceIcon } from "@/components/source-icon";
import { archiveHref } from "@/lib/archive";
import { notFound } from "next/navigation";
import { ArticleFeed } from "@/components/article-feed";
import { ErrorState } from "@/components/error-state";
import { FollowButton } from "@/components/follow-button";
import { ApiError } from "@/lib/api/client";
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
  "ada-derana": ["ada-derana-sinhala", "ada-derana"],
  "ada-derana-sinhala": ["ada-derana-sinhala", "ada-derana"],
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
  "ada-derana": { name: "Ada Derana", slug: "ada-derana-sinhala", baseUrl: "https://adaderana.lk", defaultLanguage: "SI" as Language },
  "ada-derana-sinhala": { name: "Ada Derana", slug: "ada-derana-sinhala", baseUrl: "https://adaderana.lk", defaultLanguage: "SI" as Language },
  "hiru-news": { name: "Hiru News", slug: "hiru-news-sinhala", baseUrl: "https://www.hirunews.lk", defaultLanguage: "SI" as Language },
  "hiru-news-sinhala": { name: "Hiru News", slug: "hiru-news-sinhala", baseUrl: "https://www.hirunews.lk", defaultLanguage: "SI" as Language },
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

  let articles;
  let articleError: unknown;
  for (const cand of candidates) {
    try {
      articles = await getArticles({
        page: 0,
        size: 20,
        source: cand,
        sort: "publishedAt,desc",
        displayLanguage,
      });
      if (articles && articles.content.length > 0) break;
    } catch (error) {
      articleError = error;
    }
  }

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-border border-t-4 border-t-brand bg-surface p-6 shadow-xs sm:p-8">
        <p className="eyebrow">News source</p>
        <h1 className="mt-3 flex items-center gap-5 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          <SourceIcon name={source.name} baseUrl={source.baseUrl} slug={slug} size="xl" rounded="full" />
          <span>{source.name}</span>
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
