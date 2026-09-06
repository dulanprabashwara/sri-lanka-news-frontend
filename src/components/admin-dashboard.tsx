"use client";

import Link from "next/link";
import { formatPublishedAt } from "@/lib/format";
import type { AdminArticle, AdminOverview } from "@/types/api";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowRight, RefreshCw } from "lucide-react";

export function AdminDashboard({
  overview,
  retryAction,
}: {
  overview: AdminOverview;
  retryAction?: (articleId: string) => Promise<void>;
}) {
  const cards = [
    {
      label: "Sources (Active)",
      value: `${overview.sources.enabled} / ${overview.sources.total}`,
      href: "/admin/sources",
      status: overview.sources.enabled > 0 ? ("success" as const) : ("warning" as const),
      statusLabel: `${overview.sources.enabled} Enabled`,
    },
    {
      label: "Articles",
      value: overview.articles.total.toLocaleString(),
      href: "/admin/processing",
      status: "neutral" as const,
      statusLabel: "Ingested Total",
    },
    {
      label: "Stories (Active)",
      value: `${overview.stories.recentActive} / ${overview.stories.total}`,
      href: "/admin/stories",
      status: "info" as const,
      statusLabel: `${overview.stories.recentActive} Active`,
    },
    {
      label: "Processing Failed",
      value: overview.articles.failed.toString(),
      href: "/admin/processing",
      status: overview.articles.failed > 0 ? ("danger" as const) : ("success" as const),
      statusLabel: overview.articles.failed > 0 ? "Requires Retry" : "Clean",
    },
    {
      label: "Ingestion Failed",
      value: overview.ingestion.failedRuns.toString(),
      href: "/admin/ingestion",
      status: overview.ingestion.failedRuns > 0 ? ("danger" as const) : ("success" as const),
      statusLabel: overview.ingestion.failedRuns > 0 ? "Runs Failed" : "Healthy",
    },
    {
      label: "Registered Users",
      value: overview.users.totalProfiles.toLocaleString(),
      href: "/admin/users",
      status: "neutral" as const,
      statusLabel: "Profiles",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations Console"
        title="Admin Overview"
        description="Monitor platform publisher ingestion, article processing queue, and system operational health."
      />

      <section aria-labelledby="overview-heading" className="space-y-4">
        <SectionHeader
          id="overview-heading"
          title="Operational Status & Metrics"
          description="Click any metric card to jump directly to its dedicated administrative operations page."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="group block">
              <Surface
                variant="elevated"
                className="h-full p-5 transition-shadow hover:shadow-md group-hover:border-teal-300"
              >
                <div className="flex items-center justify-between">
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </dt>
                  <StatusBadge status={card.status} label={card.statusLabel} />
                </div>
                <dd className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900 group-hover:text-teal-700">
                    {card.value}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-teal-700" />
                </dd>
              </Surface>
            </Link>
          ))}
        </div>
      </section>

      <AdminArticleTable
        title="Recent Processing Failures"
        articles={overview.recentFailures}
        retryAction={retryAction}
      />
    </div>
  );
}

function AdminArticleTable({
  title,
  articles,
  retryAction,
}: {
  title: string;
  articles: AdminArticle[];
  retryAction?: (articleId: string) => Promise<void>;
}) {
  return (
    <section aria-labelledby="processing-heading" className="space-y-4">
      <SectionHeader
        id="processing-heading"
        title={title}
        description="Recent articles that encountered errors during enrichment and require retry operations."
      />

      <Surface variant="elevated" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4">Source</th>
                <th className="p-4">Status</th>
                <th className="p-4">Discovered</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((article) => (
                <tr key={article.articleId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="max-w-md p-4">
                    <p className="font-semibold text-slate-900 line-clamp-2">{article.title}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{article.articleId}</p>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{article.source.name}</td>
                  <td className="p-4">
                    <StatusBadge
                      status={
                        article.processingStatus === "COMPLETED"
                          ? "success"
                          : article.processingStatus === "FAILED"
                          ? "danger"
                          : "warning"
                      }
                      label={article.processingStatus}
                    />
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {formatPublishedAt(article.discoveredAt)}
                  </td>
                  <td className="p-4 text-right">
                    {article.processingStatus === "FAILED" && retryAction ? (
                      <form action={retryAction.bind(null, article.articleId)}>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry
                        </button>
                      </form>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No processing failures recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Surface>
    </section>
  );
}
