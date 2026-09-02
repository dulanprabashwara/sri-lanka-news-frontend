import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { BookmarkButton } from "@/components/bookmark-button";
import { ApiError } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getArticle, getArticleStory } from "@/lib/api/news";
import { getBookmarkStatus, getPreferences, preferredDisplayLanguage } from "@/lib/api/user";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import {
  formatCategory,
  formatLanguage,
  formatPublishedAt,
} from "@/lib/format";
import { articleContent, readDisplayLanguage, translationLabel, withDisplayLanguage } from "@/lib/language";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Article" };

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { id } = await params;
  const explicitLanguage = readDisplayLanguage((await searchParams).lang);
  const accessToken = await getAuthenticatedAccessToken();
  let displayLanguage = explicitLanguage;
  if (!displayLanguage && accessToken) {
    try { displayLanguage = preferredDisplayLanguage((await getPreferences(accessToken)).preferredDisplayLanguage); } catch { /* Preference lookup is non-critical. */ }
  }
  const currentPath = withDisplayLanguage(`/article/${encodeURIComponent(id)}`, displayLanguage);
  let article;
  try {
    article = await getArticle(id, displayLanguage);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return <ErrorState message={getApiErrorMessage(error)} />;
  }

  let story = null;
  try {
    story = await getArticleStory(id, displayLanguage);
  } catch {
    // Story navigation is optional and must not prevent the Article from rendering.
  }

  let bookmarked = false;
  if (accessToken) {
    try { bookmarked = (await getBookmarkStatus(accessToken, "ARTICLE", id)).bookmarked; } catch { /* Bookmark state is non-critical. */ }
  }

  const content = articleContent(article);
  const provenance = translationLabel(content.localization, article.originalLanguage);
  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href={withDisplayLanguage(`/source/${encodeURIComponent(article.source.slug)}`, displayLanguage)}
        className="eyebrow rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
      >
        {article.source.name}
      </Link>
      <h1 className="page-title mt-4">{content.title}</h1>
      <div className="mt-5"><BookmarkButton type="ARTICLE" targetId={id} initialBookmarked={bookmarked} authenticated={Boolean(accessToken)} path={currentPath} /></div>
      {content.summary ? <p className="page-intro">{content.summary}</p> : null}
      {provenance ? <p className="mt-3 text-sm font-semibold text-violet-700">{provenance} · Platform translation</p> : null}
      <dl className="mt-8 grid gap-4 border-y border-slate-200 py-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-500">Published</dt>
          <dd className="mt-1 font-medium text-slate-900">
            <time dateTime={article.publishedAt}>
              {formatPublishedAt(article.publishedAt)}
            </time>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Language</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {formatLanguage(article.originalLanguage)}
          </dd>
        </div>
        {article.category ? (
          <div>
            <dt className="font-semibold text-slate-500">Category</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {formatCategory(article.category)}
            </dd>
          </div>
        ) : null}
        {article.authors.length > 0 ? (
          <div>
            <dt className="font-semibold text-slate-500">By</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {article.authors.join(", ")}
            </dd>
          </div>
        ) : null}
      </dl>
      {story ? (
        <Link
          href={withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, displayLanguage)}
          className="mt-8 inline-flex rounded-lg border border-teal-700 px-4 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          View full story coverage
        </Link>
      ) : null}
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-bold text-amber-950">
          Continue with the publisher
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          Full article content remains on the original publisher&apos;s website.
        </p>
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex rounded-lg bg-teal-800 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
        >
          Read original article
          <span aria-hidden="true" className="ml-2">
            ↗
          </span>
        </a>
      </div>
    </article>
  );
}
