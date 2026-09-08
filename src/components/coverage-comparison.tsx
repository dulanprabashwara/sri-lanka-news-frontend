import Link from "next/link";
import { formatLanguage, formatPublishedAt } from "@/lib/format";
import { translationLabel, withDisplayLanguage } from "@/lib/language";
import { Surface } from "@/components/ui/surface";
import type { CoverageEntity, CoverageComparison as Coverage, DisplayLanguage } from "@/types/api";
import { ExternalLink } from "lucide-react";

export function CoverageComparison({
  coverage,
  displayLanguage,
}: {
  coverage: Coverage | null;
  displayLanguage?: DisplayLanguage;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          Coverage Comparison
        </h2>
        <p className="text-xs leading-relaxed text-foreground-secondary">
          Comparison reflects extracted topics, entities, and publication metadata from available reports. It does not assess publisher intent or political stance.
        </p>
      </div>

      {coverage === null ? (
        <Surface variant="bordered" className="p-4 text-sm text-foreground-secondary" role="status">
          Publisher coverage comparison is temporarily unavailable. Story reports above are still available.
        </Surface>
      ) : (
        <div className="space-y-6">
          {!coverage.comparisonAvailable ? (
            <Surface variant="warning" className="p-4 text-sm text-amber-900" role="status">
              Coverage comparison will populate automatically when reports from multiple publishers are linked to this story.
            </Surface>
          ) : (
            <div className="text-xs font-semibold text-foreground-secondary">
              {coverage.articleCount} reports analyzed across {coverage.sourceCount} publishers
            </div>
          )}

          {(coverage.sharedTopics.length > 0 || coverage.sharedEntities.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <MetadataPanel title="Shared topics" values={coverage.sharedTopics} />
              <EntityPanel title="Shared entities" entities={coverage.sharedEntities} />
            </div>
          )}

          <div className="grid gap-5">
            {coverage.sources.map((source) => (
              <SourceCoverageCard
                key={source.source.slug}
                coverage={source}
                displayLanguage={displayLanguage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceCoverageCard({
  coverage,
  displayLanguage,
}: {
  coverage: Coverage["sources"][number];
  displayLanguage?: DisplayLanguage;
}) {
  return (
    <Surface variant="bordered" className="p-5 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{coverage.source.name}</h3>
          <p className="mt-1 text-xs text-foreground-secondary">
            {coverage.reportCount} {coverage.reportCount === 1 ? "report" : "reports"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {coverage.languages.map((language) => (
            <span
              key={language}
              className="rounded bg-surface-muted px-2.5 py-1 text-xs font-semibold text-foreground-secondary"
            >
              {formatLanguage(language)}
            </span>
          ))}
        </div>
      </div>

      <dl className="grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-foreground-secondary">First Published</dt>
          <dd className="mt-1 font-mono text-foreground">{formatPublishedAt(coverage.firstPublishedAt)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground-secondary">Latest Published</dt>
          <dd className="mt-1 font-mono text-foreground">{formatPublishedAt(coverage.lastPublishedAt)}</dd>
        </div>
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetadataPanel title="Topics Mentioned" values={coverage.topics} />
        <MetadataPanel title="Source-specific topics" values={coverage.uniqueTopics} />
        <EntityPanel title="Entities Mentioned" entities={coverage.entities} />
        <EntityPanel title="Source-specific entities" entities={coverage.uniqueEntities} />
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
          Reports from {coverage.source.name}
        </h4>
        <ul className="space-y-4">
          {coverage.articles.map((article) => (
            <li key={article.id} className="text-xs space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-foreground-secondary">
                <span>{formatLanguage(article.originalLanguage)}</span>
                <span>•</span>
                <time dateTime={article.publishedAt} className="font-mono">
                  {formatPublishedAt(article.publishedAt)}
                </time>
              </div>
              <Link
                href={withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage)}
                className="block font-bold text-foreground hover:text-brand hover:underline transition-colors"
              >
                {article.localizedContent?.title ?? article.title}
              </Link>
              {(article.localizedContent?.summary ?? article.summary) && (
                <p className="text-xs leading-relaxed text-foreground-secondary">
                  {article.localizedContent?.summary ?? article.summary}
                </p>
              )}
              {translationLabel(article.localizedContent, article.originalLanguage) && (
                <p className="text-xs font-semibold text-brand">
                  {translationLabel(article.localizedContent, article.originalLanguage)} • Platform translation
                </p>
              )}
              <div>
                <a
                  href={article.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                >
                  <span>Original Publisher</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Surface>
  );
}

function MetadataPanel({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-bold text-foreground-secondary">{title}</h4>
      {values.length === 0 ? (
        <p className="text-xs text-foreground-secondary italic">None extracted</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand"
            >
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EntityPanel({ title, entities }: { title: string; entities: CoverageEntity[] }) {
  return <MetadataPanel title={title} values={entities.map((entity) => `${entity.name} (${entity.type})`)} />;
}
