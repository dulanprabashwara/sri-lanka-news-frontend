import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { ApiError } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getArticle, getArticleStory } from "@/lib/api/news";
import {
  formatCategory,
  formatLanguage,
  formatPublishedAt,
} from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Article" };

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let article;
  try {
    article = await getArticle(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return <ErrorState message={getApiErrorMessage(error)} />;
  }

  let story = null;
  try {
    story = await getArticleStory(id);
  } catch {
    // Story navigation is optional and must not prevent the Article from rendering.
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href={`/source/${encodeURIComponent(article.source.slug)}`}
        className="eyebrow rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
      >
        {article.source.name}
      </Link>
      <h1 className="page-title mt-4">{article.title}</h1>
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
          href={`/story/${encodeURIComponent(story.id)}`}
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
