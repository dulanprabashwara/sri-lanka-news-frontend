import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminStories, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { formatPublishedAt } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stories | Admin" };

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/stories");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/stories");

  const page = searchParams.page ? parseInt(searchParams.page, 10) : 0;
  let storiesPage;
  let denied = false;
  
  try {
    await getAdminMe(token);
    storiesPage = await getAdminStories(token, page, 50);
  } catch (error: any) {
    if (error?.status === 401) redirect("/auth/login?next=/admin/stories");
    if (error?.status === 403) denied = true;
    else throw error;
  }

  if (denied) return <div className="state-panel" role="alert"><h1 className="text-2xl font-bold text-slate-950">Admin access required.</h1></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Stories</h1>
        <p className="page-intro">Aggregated narrative clusters and their metadata.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Articles</th>
              <th className="p-4">Sources</th>
              <th className="p-4">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {storiesPage!.content.map((story) => (
              <tr key={story.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="max-w-md p-4">
                  <div className="font-semibold text-slate-900">{story.displayTitle}</div>
                  <div className="text-xs text-slate-400 mt-0.5">ID: {story.id}</div>
                </td>
                <td className="p-4">
                  {story.category ? (
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {story.category}
                    </span>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="p-4 font-medium text-slate-700">{story.articleCount}</td>
                <td className="p-4 font-medium text-slate-700">{story.sourceCount}</td>
                <td className="p-4 text-slate-500">{formatPublishedAt(story.lastPublishedAt)}</td>
              </tr>
            ))}
            {storiesPage!.content.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No stories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Showing page {storiesPage!.page + 1} of {storiesPage!.totalPages} ({storiesPage!.totalElements} total)
        </div>
        <div className="flex gap-2">
          {!storiesPage!.first && (
            <a href={`?page=${storiesPage!.page - 1}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">Previous</a>
          )}
          {!storiesPage!.last && (
            <a href={`?page=${storiesPage!.page + 1}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">Next</a>
          )}
        </div>
      </div>
    </div>
  );
}
