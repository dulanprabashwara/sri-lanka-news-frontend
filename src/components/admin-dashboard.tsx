import { formatPublishedAt } from "@/lib/format";
import type { AdminArticle, AdminOverview, AdminSource } from "@/types/api";

export function AdminDashboard({ overview, articles, sources, retryAction }: {
  overview: AdminOverview;
  articles: AdminArticle[];
  sources: AdminSource[];
  retryAction?: (articleId: string) => Promise<void>;
}) {
  const cards = [
    ["Sources", overview.sources.total],
    ["Articles", overview.articles.total],
    ["Stories", overview.stories.total],
    ["Failed processing", overview.articles.failed],
  ] as const;
  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Operations</p><h1 className="page-title">Admin</h1>
          <p className="page-intro">Monitor publisher ingestion and processing health.</p>
        </div>
        <a href="/admin/ingestion" className="inline-flex rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700">
          Ingestion Controls
        </a>
      </header>
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="text-xl font-bold text-slate-950">Overview</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <dt className="text-sm font-semibold text-slate-500">{label}</dt>
            <dd className="mt-2 text-3xl font-black text-slate-950">{value}</dd>
          </div>)}
        </dl>
      </section>
      <AdminArticleTable title="Recent processing" articles={articles} retryAction={retryAction} />
      <section aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="text-xl font-bold text-slate-950">Sources</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>
            <th className="p-4">Publisher</th><th className="p-4">Language</th>
            <th className="p-4">Ingestion</th><th className="p-4">Articles</th><th className="p-4">Status</th>
          </tr></thead><tbody>{sources.map((source) => <tr key={source.id} className="border-t border-slate-100">
            <td className="p-4"><a href={source.baseUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800">{source.name}</a><div className="text-xs text-slate-500">{source.slug}</div></td>
            <td className="p-4 uppercase">{source.defaultLanguage}</td><td className="p-4">{source.ingestionType}</td>
            <td className="p-4">{source.articleCount}</td><td className="p-4">{source.enabled ? "Enabled" : "Unavailable"}</td>
          </tr>)}</tbody></table>
        </div>
      </section>
    </div>
  );
}

function AdminArticleTable({ title, articles, retryAction }: { title: string; articles: AdminArticle[]; retryAction?: (articleId: string) => Promise<void> }) {
  return <section aria-labelledby="processing-heading"><h2 id="processing-heading" className="text-xl font-bold text-slate-950">{title}</h2>
    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Article</th><th className="p-4">Source</th><th className="p-4">Status</th><th className="p-4">Discovered</th><th className="p-4">Action</th></tr></thead>
      <tbody>{articles.map((article) => <tr key={article.articleId} className="border-t border-slate-100">
        <td className="max-w-md p-4 font-semibold text-slate-900">{article.title}</td><td className="p-4">{article.source.name}</td>
        <td className="p-4">{article.processingStatus}</td><td className="p-4">{formatPublishedAt(article.discoveredAt)}</td>
        <td className="p-4">{article.processingStatus === "FAILED" && retryAction ? <form action={retryAction.bind(null, article.articleId)}><button className="rounded-lg border border-teal-700 px-3 py-1.5 font-semibold text-teal-800">Retry</button></form> : <span className="text-slate-400">—</span>}</td>
      </tr>)}</tbody></table></div>
  </section>;
}
