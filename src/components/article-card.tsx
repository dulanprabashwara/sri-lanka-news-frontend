import Link from "next/link";
import {
  formatCategory,
  formatLanguage,
  formatPublishedAt,
} from "@/lib/format";
import { articleContent, translationLabel, withDisplayLanguage } from "@/lib/language";
import type { Article, DisplayLanguage } from "@/types/api";

interface ArticleCardProps {
  article: Article;
  displayLanguage?: DisplayLanguage;
}

export function ArticleCard({ article, displayLanguage }: ArticleCardProps) {
  const content = articleContent(article);
  const provenance = translationLabel(content.localization, article.originalLanguage);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md overflow-hidden flex flex-col sm:flex-row">
      {article.leadMedia?.type === "IMAGE" ? (
        <div className="sm:w-1/3 shrink-0 relative bg-slate-100 aspect-video sm:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.leadMedia.url}
            alt={article.leadMedia.altText || content.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="p-5 sm:p-6 flex flex-col grow">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Link
          href={withDisplayLanguage(`/source/${encodeURIComponent(article.source.slug)}`, displayLanguage)}
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
      <h2 className="text-xl font-bold leading-snug tracking-tight text-slate-950 sm:text-2xl break-words">
        <Link
          href={withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage)}
          className="rounded-sm hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        >
          {content.title}
        </Link>
      </h2>
      {content.summary ? <p className="mt-3 text-sm leading-6 text-slate-600 break-words">{content.summary}</p> : null}
      {provenance ? <p className="mt-2 text-xs font-semibold text-violet-700">{provenance} · Platform translation</p> : null}
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
      </div>
    </article>
  );
}
