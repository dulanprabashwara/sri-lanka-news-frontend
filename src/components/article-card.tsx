import Link from "next/link";
import {
  formatCategory,
  formatLanguage,
  formatPublishedAt,
} from "@/lib/format";
import type { Article } from "@/types/api";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Link
          href={`/source/${encodeURIComponent(article.source.slug)}`}
          className="text-teal-700 hover:text-teal-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          {article.source.name}
        </Link>
        <span aria-hidden="true" className="text-slate-300">
          •
        </span>
        <time dateTime={article.publishedAt}>
          {formatPublishedAt(article.publishedAt)}
        </time>
      </div>
      <h2 className="text-xl font-bold leading-snug tracking-tight text-slate-950 sm:text-2xl">
        <Link
          href={`/article/${encodeURIComponent(article.id)}`}
          className="rounded-sm hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        >
          {article.title}
        </Link>
      </h2>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
        {article.category ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900">
            {formatCategory(article.category)}
          </span>
        ) : null}
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {formatLanguage(article.originalLanguage)}
        </span>
      </div>
    </article>
  );
}
