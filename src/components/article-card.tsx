import Link from "next/link";
import { formatCategory, formatLanguage, formatPublishedAt } from "@/lib/format";
import { articleContent, translationLabel, withDisplayLanguage } from "@/lib/language";
import type { Article, DisplayLanguage } from "@/types/api";

interface ArticleCardProps {
  article: Article;
  displayLanguage?: DisplayLanguage;
  variant?: "default" | "compact";
}

export function ArticleCard({
  article,
  displayLanguage,
  variant = "default",
}: ArticleCardProps) {
  const content = articleContent(article);
  const provenance = translationLabel(content.localization, article.originalLanguage);

  if (variant === "compact") {
    return (
      <article className="group flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-surface hover:border-brand-soft hover:bg-surface-muted/60 transition-all">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-foreground-muted">
          <Link
            href={withDisplayLanguage(`/source/${encodeURIComponent(article.source.slug)}`, displayLanguage)}
            className="text-brand font-bold hover:underline focus-visible:outline-2 focus-visible:outline-brand truncate"
          >
            {article.source.name}
          </Link>
          <time dateTime={article.publishedAt} className="shrink-0 text-[11px]">
            {formatPublishedAt(article.publishedAt)}
          </time>
        </div>
        <h3 className="text-sm font-bold leading-snug text-foreground group-hover:text-brand transition-colors line-clamp-2 break-words">
          <Link
            href={withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage)}
            className="focus-visible:outline-2 focus-visible:outline-brand"
          >
            {content.title}
          </Link>
        </h3>
        <div className="flex items-center justify-between text-[11px] font-medium text-foreground-muted pt-1">
          {article.category ? (
            <span className="rounded bg-surface-muted px-1.5 py-0.5 text-foreground-secondary font-medium border border-border">
              {formatCategory(article.category)}
            </span>
          ) : <span />}
          <span className="uppercase tracking-wider font-semibold text-foreground-muted">
            {formatLanguage(article.originalLanguage)}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-2xl border border-border bg-surface shadow-xs transition-all hover:border-brand-soft hover:shadow-md overflow-hidden flex flex-col sm:flex-row">
      {article.leadMedia?.type === "IMAGE" && article.leadMedia?.url ? (
        <div className="sm:w-1/3 shrink-0 relative bg-surface-muted aspect-video sm:aspect-auto min-h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.leadMedia.url}
            alt={article.leadMedia.altText || content.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-102"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="p-5 sm:p-6 flex flex-col grow justify-between">
        <div>
          {/* Header Metadata */}
          <div className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-foreground-muted">
            <span className="inline-flex items-center gap-1 rounded bg-brand-soft/50 px-2 py-0.5 text-[11px] font-bold text-brand uppercase tracking-wider">
              Single Report
            </span>
            <span aria-hidden="true" className="text-border-strong">
              •
            </span>
            <Link
              href={withDisplayLanguage(`/source/${encodeURIComponent(article.source.slug)}`, displayLanguage)}
              className="text-foreground font-bold hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
            >
              {article.source.name}
            </Link>
            <span aria-hidden="true" className="text-border-strong">
              •
            </span>
            <time dateTime={article.publishedAt}>
              {formatPublishedAt(article.publishedAt)}
            </time>
          </div>

          {/* Headline */}
          <h2 className="text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl break-words group-hover:text-brand transition-colors">
            <Link
              href={withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage)}
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {content.title}
            </Link>
          </h2>

          {/* Summary */}
          {content.summary ? (
            <p className="mt-2.5 text-sm leading-relaxed text-foreground-secondary break-words line-clamp-3">
              {content.summary}
            </p>
          ) : null}

          {/* Translation Provenance */}
          {provenance ? (
            <p className="mt-2 text-xs font-semibold text-brand">
              {provenance} · Platform translation
            </p>
          ) : null}
        </div>

        {/* Footer Badges */}
        <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <div className="flex items-center gap-2">
            {article.category ? (
              <span className="rounded-md bg-surface-muted border border-border px-2.5 py-1 text-foreground-secondary">
                {formatCategory(article.category)}
              </span>
            ) : null}
            <span className="rounded-md bg-surface-muted border border-border px-2.5 py-1 text-foreground-muted">
              {formatLanguage(article.originalLanguage)}
            </span>
          </div>

          <Link
            href={withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage)}
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
          >
            Read report →
          </Link>
        </div>
      </div>
    </article>
  );
}
