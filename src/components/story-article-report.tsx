import Link from "next/link";
import { formatCategory, formatLanguage, formatPublishedAt } from "@/lib/format";
import { articleContent, translationLabel, withDisplayLanguage } from "@/lib/language";
import { Surface } from "@/components/ui/surface";
import type { Article, DisplayLanguage } from "@/types/api";
import { ExternalLink } from "lucide-react";

export function StoryArticleReport({
  article,
  displayLanguage,
}: {
  article: Article;
  displayLanguage?: DisplayLanguage;
}) {
  const content = articleContent(article);
  const provenance = translationLabel(content.localization, article.originalLanguage);

  return (
    <Surface
      variant="bordered"
      className="p-5 sm:p-6 space-y-4 overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground-secondary">
        <Link
          href={withDisplayLanguage(`/source/${encodeURIComponent(article.source.slug)}`, displayLanguage)}
          className="font-bold text-brand hover:underline"
        >
          {article.source.name}
        </Link>
        <span>•</span>
        <time dateTime={article.publishedAt} className="font-mono">
          {formatPublishedAt(article.publishedAt)}
        </time>
        {article.originalLanguage && (
          <span className="rounded bg-surface-muted px-2 py-0.5 text-xs font-medium text-foreground-secondary">
            {formatLanguage(article.originalLanguage)}
          </span>
        )}
        {article.category && (
          <span className="rounded bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
            {formatCategory(article.category)}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {article.leadMedia?.type === "IMAGE" && article.leadMedia.url && (
          <div className="sm:w-48 shrink-0 bg-surface-muted rounded-lg overflow-hidden aspect-video sm:aspect-auto sm:h-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.leadMedia.url}
              alt={article.leadMedia.altText || content.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="space-y-2 grow">
          <h3 className="text-base sm:text-lg font-bold text-foreground hover:text-brand">
            <Link
              href={withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage)}
              className="hover:underline transition-colors"
            >
              {content.title}
            </Link>
          </h3>

          {content.summary && (
            <p className="text-xs leading-relaxed text-foreground-secondary line-clamp-3">
              {content.summary}
            </p>
          )}

          {provenance && (
            <p className="text-xs font-semibold text-brand">
              {provenance} • Platform translation
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border text-xs">
        <Link
          href={withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage)}
          className="font-bold text-brand hover:underline"
        >
          View Article Metadata & Summary →
        </Link>
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-foreground-secondary hover:text-brand transition-colors"
        >
          <span>Read on {article.source.name}</span>
          <ExternalLink className="size-3" />
        </a>
      </div>
    </Surface>
  );
}
