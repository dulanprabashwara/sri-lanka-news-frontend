import Link from "next/link";
import { formatCategory, formatLanguage, formatPublishedAt } from "@/lib/format";
import { articleContent, translationLabel, withDisplayLanguage } from "@/lib/language";
import type { Article, DisplayLanguage } from "@/types/api";

export function StoryArticleReport({ article, displayLanguage }: { article: Article; displayLanguage?: DisplayLanguage }) {
  const content = articleContent(article);
  const provenance = translationLabel(content.localization, article.originalLanguage);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Link href={withDisplayLanguage(`/source/${encodeURIComponent(article.source.slug)}`, displayLanguage)} className="text-teal-700 hover:underline">
          {article.source.name}
        </Link>
        <time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time>
      </div>
      <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
        <Link href={withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage)} className="hover:text-teal-800 hover:underline">
          {content.title}
        </Link>
      </h2>
      {content.summary ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">{content.summary}</p>
      ) : null}
      {provenance ? <p className="mt-2 text-xs font-semibold text-violet-700">{provenance} · Platform translation</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1">{formatLanguage(article.originalLanguage)}</span>
        {article.category ? <span>{formatCategory(article.category)}</span> : null}
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-teal-700 hover:underline"
        >
          Original publisher ↗
        </a>
      </div>
    </article>
  );
}
