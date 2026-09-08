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

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "News source" };

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
  let source;
  try {
    source = await getSource(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return <ErrorState message={getApiErrorMessage(error)} />;
  }

  let followed = false;
  if (accessToken) {
    try { followed = (await getSourceFollowStatus(accessToken, slug)).followed; } catch { /* Follow status is non-critical. */ }
  }

  let articles;
  let articleError: unknown;
  try {
    articles = await getArticles({
      page: 0,
      size: 20,
      source: source.slug,
      sort: "publishedAt,desc",
      displayLanguage,
    });
  } catch (error) {
    articleError = error;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-border border-t-4 border-t-brand bg-surface p-6 shadow-xs sm:p-8">
        <p className="eyebrow">News source</p>
        <h1 className="mt-3 flex items-center gap-5 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          <SourceIcon name={source.name} baseUrl={source.baseUrl} slug={source.slug} size="xl" rounded="full" />
          <span>{source.name}</span>
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Default language: {formatLanguage(source.defaultLanguage)}
        </p>
        <div className="mt-5"><FollowButton type="SOURCE" target={slug} initialFollowed={followed} authenticated={Boolean(accessToken)} path={currentPath} /></div>
        <a
          href={source.baseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 ml-3 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Visit publisher
          <span aria-hidden="true" className="ml-2">
            ↗
          </span>
        </a>
      </header>
      <section aria-labelledby="source-articles-title">
        <h2
          id="source-articles-title"
          className="mb-5 text-2xl font-extrabold tracking-tight text-slate-950"
        >
          Latest articles
        </h2>
        {articleError ? (
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
