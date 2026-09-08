import Link from "next/link";
import { PublisherImage } from "@/components/ui/publisher-image";
import { isPublisherPlaceholder } from "@/components/ui/publisher-image-utils";
import { formatCategory, formatLanguage, formatPublishedAt } from "@/lib/format";
import { articleContent, articleContentLanguage, translationLabel, withDisplayLanguage } from "@/lib/language";
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
  const contentLanguage = articleContentLanguage(article);
  const provenance = translationLabel(content.localization, article.originalLanguage);
  const articleUrl = withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage);
  const sourceUrl = withDisplayLanguage(`/source/${encodeURIComponent(article.source.slug)}`, displayLanguage);

  if (variant === "compact") {
    return (
      <article className="group flex flex-col gap-1.5 p-3.5 rounded-xl border border-border bg-surface hover:border-brand-soft hover:bg-surface-muted/50 transition-all shadow-2xs">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-foreground-muted">
          <Link
            href={sourceUrl}
            className="text-brand font-bold hover:underline focus-visible:outline-2 focus-visible:outline-brand truncate"
          >
            {article.source.name}
          </Link>
          <time dateTime={article.publishedAt} className="shrink-0 text-xs">
            {formatPublishedAt(article.publishedAt)}
          </time>
        </div>
        <h3
          lang={contentLanguage}
          className="text-sm font-bold leading-snug text-foreground group-hover:text-brand transition-colors line-clamp-2 wrap-break-word"
        >
          <Link href={articleUrl} className="focus-visible:outline-2 focus-visible:outline-brand">
            {content.title}
          </Link>
        </h3>
        {displayLanguage && content.localization?.fallback ? (
          <p className="mt-1 inline-flex w-fit rounded-md bg-warning-soft px-1.5 py-0.5 text-[0.65rem] font-semibold text-warning">
            {formatLanguage(displayLanguage)} translation unavailable
          </p>
        ) : null}
        <div className="flex items-center justify-between text-xs font-medium text-foreground-muted pt-1">
          {article.category ? (
            <span className="rounded bg-surface-muted px-1.5 py-0.5 text-foreground-secondary font-medium border border-border">
              {formatCategory(article.category)}
            </span>
          ) : (
            <span />
          )}
          <span className="uppercase tracking-wider font-semibold text-foreground-muted">
            {formatLanguage(article.originalLanguage)}
          </span>
        </div>
      </article>
    );
  }

  const hasLeadImage =
    article.leadMedia?.type === "IMAGE" && Boolean(article.leadMedia?.url) && !isPublisherPlaceholder(article.leadMedia.url);

  return (
    <article className="group rounded-2xl border border-border bg-surface shadow-xs transition-all hover:border-brand-soft hover:shadow-md overflow-hidden flex flex-col sm:flex-row">
      {hasLeadImage ? (
        <div className="sm:w-[30%] shrink-0">
          <PublisherImage
            src={article.leadMedia?.url}
            alt={article.leadMedia?.altText || content.title}
            aspectRatio="16/10"
            className="w-full h-full min-h-40 border-b sm:border-b-0 sm:border-r border-border/60"
          />
        </div>
      ) : null}

      <div className="p-5 sm:p-6 flex flex-col grow justify-between">
        <div>
          {/* Header Metadata */}
          <div className="mb-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-foreground-muted">
            <span className="inline-flex items-center gap-1 rounded bg-brand-soft/50 px-2 py-0.5 text-xs font-bold text-brand uppercase tracking-wider">
              Single Report
            </span>
            <span aria-hidden="true" className="text-border-strong">
              •
            </span>
            <Link
              href={sourceUrl}
              className="text-foreground font-bold hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
            >
              {article.source.name}
            </Link>
            <span aria-hidden="true" className="text-border-strong">
              •
            </span>
            <time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time>
          </div>

          {/* Headline */}
          <h2
            lang={contentLanguage}
            className="font-serif text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl wrap-break-word group-hover:text-brand transition-colors"
          >
            <Link
              href={articleUrl}
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {content.title}
            </Link>
          </h2>

          {/* Summary */}
          {content.summary ? (
            <p
              lang={contentLanguage}
              className="mt-2.5 text-sm leading-relaxed text-foreground-secondary wrap-break-word line-clamp-3"
            >
              {content.summary}
            </p>
          ) : null}

          {/* Translation Provenance or Fallback Notice */}
          {displayLanguage && content.localization?.fallback ? (
            <p className="mt-2.5 inline-flex rounded-md bg-warning-soft px-2 py-1 text-[0.7rem] font-semibold text-warning">
              {formatLanguage(displayLanguage)} translation unavailable · Showing {formatLanguage(content.localization.resolvedLanguage)} original
            </p>
          ) : provenance ? (
            <p className="mt-2.5 text-xs font-semibold text-brand">
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

          <Link href={articleUrl} className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
            Read report →
          </Link>
        </div>
      </div>
    </article>
  );
}
