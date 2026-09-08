/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminProcessingArticles, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { retryFailedArticle } from "@/app/admin-actions";
import { formatPublishedAt } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Processing Queue | Admin" };

export default async function AdminProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/processing");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/processing");

  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 0;
  let articlesPage;
  let denied = false;

  try {
    await getAdminMe(token);
    articlesPage = await getAdminProcessingArticles(token, page, 50);
  } catch (error: any) {
    if (error?.status === 401) redirect("/auth/login?next=/admin/processing");
    if (error?.status === 403) denied = true;
    else throw error;
  }

  if (denied)
    return (
      <Surface variant="elevated" className="p-8 text-center" role="alert">
        <h1 className="text-xl font-bold text-slate-900">Admin access required.</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your authenticated account is not authorized to access processing queue controls.
        </p>
      </Surface>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations Console"
        title="Processing Queue"
        description="Monitor article enrichment processing state, attempt counts, and retry failed processing jobs."
      />

      <section aria-labelledby="queue-heading" className="space-y-4">
        <SectionHeader
          id="queue-heading"
          title="Recent Articles Queue"
          description="Inbound articles and their current pipeline processing statuses."
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
                {articlesPage!.content.map((article) => (
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
                    <td className="p-4 text-xs text-slate-500">
                      {formatPublishedAt(article.discoveredAt)}
                    </td>
                    <td className="p-4 text-right">
                      {article.processingStatus === "FAILED" ? (
                        <form action={retryFailedArticle.bind(null, article.articleId)}>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft/30 focus:outline-hidden focus:ring-2 focus:ring-brand"
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
                {articlesPage!.content.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No articles in processing queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Surface>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs font-medium text-slate-500">
            Showing page <span className="font-semibold text-slate-900">{articlesPage!.page + 1}</span> of{" "}
            <span className="font-semibold text-slate-900">{articlesPage!.totalPages}</span> (
            {articlesPage!.totalElements} total)
          </p>
          <div className="flex gap-2">
            {!articlesPage!.first && (
              <a
                href={`?page=${articlesPage!.page - 1}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </a>
            )}
            {!articlesPage!.last && (
              <a
                href={`?page=${articlesPage!.page + 1}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
