import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminProcessingArticles, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { retryFailedArticle } from "@/app/admin-actions";
import { formatPublishedAt } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Processing | Admin" };

export default async function AdminProcessingPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/processing");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/processing");

  const page = searchParams.page ? parseInt(searchParams.page, 10) : 0;
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

  if (denied) return <div className="state-panel" role="alert"><h1 className="text-2xl font-bold text-slate-950">Admin access required.</h1></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Processing queue</h1>
        <p className="page-intro">Recent articles and their processing state.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4">Article</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
              <th className="p-4">Discovered</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {articlesPage!.content.map((article) => (
              <tr key={article.articleId} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="max-w-md p-4 font-semibold text-slate-900">{article.title}</td>
                <td className="p-4">{article.source.name}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    article.processingStatus === "COMPLETED" ? "bg-green-50 text-green-700" :
                    article.processingStatus === "FAILED" ? "bg-red-50 text-red-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>
                    {article.processingStatus}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{formatPublishedAt(article.discoveredAt)}</td>
                <td className="p-4">
                  {article.processingStatus === "FAILED" ? (
                    <form action={retryFailedArticle.bind(null, article.articleId)}>
                      <button className="rounded-lg border border-teal-700 px-3 py-1.5 font-semibold text-teal-800 hover:bg-teal-50">
                        Retry
                      </button>
                    </form>
                  ) : <span className="text-slate-400">—</span>}
                </td>
              </tr>
            ))}
            {articlesPage!.content.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No articles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Showing page {articlesPage!.page + 1} of {articlesPage!.totalPages} ({articlesPage!.totalElements} total)
        </div>
        <div className="flex gap-2">
          {!articlesPage!.first && (
            <a href={`?page=${articlesPage!.page - 1}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">Previous</a>
          )}
          {!articlesPage!.last && (
            <a href={`?page=${articlesPage!.page + 1}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">Next</a>
          )}
        </div>
      </div>
    </div>
  );
}
