import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminStories, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { formatPublishedAt } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stories Administration | Admin" };

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
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const errStatus = (error as { status?: number }).status;
      if (errStatus === 401) redirect("/auth/login?next=/admin/stories");
      if (errStatus === 403) denied = true;
      else throw error;
    } else {
      throw error;
    }
  }

  if (denied)
    return (
      <Surface variant="elevated" className="p-8 text-center" role="alert">
        <h1 className="text-xl font-bold text-slate-900">Admin access required.</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your authenticated account is not authorized to access stories administration.
        </p>
      </Surface>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content Intelligence"
        title="Stories Administration"
        description="Monitor narrative story clusters, article counts, source diversity, and cluster publication dates."
      />

      <section aria-labelledby="stories-heading" className="space-y-4">
        <SectionHeader
          id="stories-heading"
          title="Aggregated Story Clusters"
          description="Multilingual story clusters compiled by platform clustering engines."
        />

        <Surface variant="elevated" className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Articles</th>
                  <th className="p-4">Sources</th>
                  <th className="p-4 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storiesPage!.content.map((story) => (
                  <tr key={story.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="max-w-md p-4">
                      <p className="font-semibold text-slate-900 line-clamp-2">{story.displayTitle}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{story.id}</p>
                    </td>
                    <td className="p-4">
                      {story.category ? (
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          {story.category}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-800">{story.articleCount}</td>
                    <td className="p-4 font-mono font-medium text-slate-800">{story.sourceCount}</td>
                    <td className="p-4 text-right text-xs text-slate-500">
                      {formatPublishedAt(story.lastPublishedAt)}
                    </td>
                  </tr>
                ))}
                {storiesPage!.content.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No story clusters found.
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
            Showing page <span className="font-semibold text-slate-900">{storiesPage!.page + 1}</span> of{" "}
            <span className="font-semibold text-slate-900">{storiesPage!.totalPages}</span> (
            {storiesPage!.totalElements} total)
          </p>
          <div className="flex gap-2">
            {!storiesPage!.first && (
              <a
                href={`?page=${storiesPage!.page - 1}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </a>
            )}
            {!storiesPage!.last && (
              <a
                href={`?page=${storiesPage!.page + 1}`}
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
