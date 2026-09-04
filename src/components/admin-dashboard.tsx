import { formatPublishedAt } from "@/lib/format";
import type { AdminArticle, AdminOverview, AdminSource } from "@/types/api";

export function AdminDashboard({ overview, retryAction }: {
  overview: AdminOverview;
  retryAction?: (articleId: string) => Promise<void>;
}) {
  const cards = [
    ["Sources (Active)", `${overview.sources.enabled} / ${overview.sources.total}`],
    ["Articles", overview.articles.total.toLocaleString()],
    ["Stories (Active)", `${overview.stories.recentActive} / ${overview.stories.total}`],
    ["Processing Failed", overview.articles.failed],
    ["Ingestion Failed", overview.ingestion.failedRuns],
    ["Registered Users", overview.users.totalProfiles.toLocaleString()],
  ] as const;
  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Operations</p><h1 className="page-title">Admin</h1>
          <p className="page-intro">Monitor publisher ingestion and processing health.</p>
        </div>
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
      <AdminArticleTable title="Recent processing failures" articles={overview.recentFailures} retryAction={retryAction} />
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
