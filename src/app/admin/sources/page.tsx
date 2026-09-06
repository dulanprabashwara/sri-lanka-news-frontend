import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSources, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLink } from "lucide-react";
import type { AdminSource } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Publisher Sources | Admin" };

export default async function AdminSourcesPage() {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/sources");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/sources");

  let sources: AdminSource[] = [];
  let denied = false;

  try {
    await getAdminMe(token);
    sources = await getAdminSources(token);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const errStatus = (error as { status?: number }).status;
      if (errStatus === 401) redirect("/auth/login?next=/admin/sources");
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
          Your authenticated account is not authorized to access publisher sources administration.
        </p>
      </Surface>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations Console"
        title="Publisher Sources"
        description="View configured news publishers, ingestion strategies, primary language codes, and active status."
      />

      <section aria-labelledby="sources-heading" className="space-y-4">
        <SectionHeader
          id="sources-heading"
          title="Configured News Publishers"
          description="Registered publisher targets and their article ingestion statistics."
        />

        <Surface variant="elevated" className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="p-4">Publisher</th>
                  <th className="p-4">Language</th>
                  <th className="p-4">Ingestion Type</th>
                  <th className="p-4">Ingested Articles</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sources.map((source) => (
                  <tr key={source.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <a
                        href={source.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-teal-800 hover:text-teal-900 hover:underline"
                      >
                        {source.name}
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{source.slug}</p>
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold uppercase text-slate-700">
                      {source.defaultLanguage}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600">
                      {source.ingestionType}
                    </td>
                    <td className="p-4 font-mono text-sm font-semibold text-slate-900">
                      {source.articleCount.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <StatusBadge
                        status={source.enabled ? "success" : "danger"}
                        label={source.enabled ? "Enabled" : "Unavailable"}
                      />
                    </td>
                  </tr>
                ))}
                {sources.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No publisher sources configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Surface>
      </section>
    </div>
  );
}
