import Link from "next/link";
import { formatLanguage, formatPublishedAt } from "@/lib/format";
import type { CoverageEntity, CoverageComparison as Coverage } from "@/types/api";

export function CoverageComparison({ coverage }: { coverage: Coverage | null }) {
  return (
    <section aria-labelledby="coverage-comparison-title" className="border-t border-slate-200 pt-8">
      <div className="max-w-3xl">
        <p className="eyebrow">Publisher metadata</p>
        <h2 id="coverage-comparison-title" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          Coverage Comparison
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Comparison reflects metadata extracted from available reports and does not assess accuracy or publisher intent.
        </p>
      </div>

      {coverage === null ? (
        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600" role="status">
          Coverage comparison is temporarily unavailable. The Story reports above are still available.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {!coverage.comparisonAvailable ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900" role="status">
              Coverage comparison will appear when reports from multiple publishers are linked to this story.
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-700">
              {coverage.articleCount} reports from {coverage.sourceCount} publishers
            </p>
          )}

          {coverage.sharedTopics.length > 0 || coverage.sharedEntities.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <MetadataPanel title="Shared topics" values={coverage.sharedTopics} />
              <EntityPanel title="Shared entities" entities={coverage.sharedEntities} />
            </div>
          ) : null}

          <div className="grid gap-5">
            {coverage.sources.map((source) => (
              <SourceCoverageCard key={source.source.slug} coverage={source} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SourceCoverageCard({ coverage }: { coverage: Coverage["sources"][number] }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-950">{coverage.source.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {coverage.reportCount} {coverage.reportCount === 1 ? "report" : "reports"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {coverage.languages.map((language) => (
            <span key={language} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {formatLanguage(language)}
            </span>
          ))}
        </div>
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-semibold text-slate-500">First published</dt><dd className="mt-1 text-slate-900">{formatPublishedAt(coverage.firstPublishedAt)}</dd></div>
        <div><dt className="font-semibold text-slate-500">Latest published</dt><dd className="mt-1 text-slate-900">{formatPublishedAt(coverage.lastPublishedAt)}</dd></div>
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <MetadataPanel title="Topics mentioned by this source" values={coverage.topics} />
        <MetadataPanel title="Source-specific topics" values={coverage.uniqueTopics} />
        <EntityPanel title="Entities mentioned" entities={coverage.entities} />
        <EntityPanel title="Source-specific entities" entities={coverage.uniqueEntities} />
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Reports</h4>
        <ul className="mt-3 space-y-4">
          {coverage.articles.map((article) => (
            <li key={article.id} className="text-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{formatLanguage(article.originalLanguage)}</span>
                <time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time>
              </div>
              <Link href={`/article/${encodeURIComponent(article.id)}`} className="mt-1 block font-bold text-slate-900 hover:text-teal-800 hover:underline">
                {article.title}
              </Link>
              {article.summary ? <p className="mt-2 leading-6 text-slate-600">{article.summary}</p> : null}
              <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-teal-700 hover:underline">
                Original publisher ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function MetadataPanel({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      {values.length === 0 ? <p className="mt-2 text-sm text-slate-500">None available</p> : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => <li key={value} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">{value}</li>)}
        </ul>
      )}
    </div>
  );
}

function EntityPanel({ title, entities }: { title: string; entities: CoverageEntity[] }) {
  return <MetadataPanel title={title} values={entities.map((entity) => `${entity.name} · ${entity.type}`)} />;
}
