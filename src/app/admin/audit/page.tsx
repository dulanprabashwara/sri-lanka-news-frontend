import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminAuditEvents, getAdminMe } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { getValidatedAuth } from "@/lib/auth";
import { formatPublishedAt } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminAuditEvent } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Audit Logs | Admin" };

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/audit");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/audit");

  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 0;
  let logsPage;
  let denied = false;

  try {
    await getAdminMe(token);
    logsPage = await getAdminAuditEvents(token, page, 50);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth/login?next=/admin/audit");
    if (error instanceof ApiError && error.status === 403) denied = true;
    else throw error;
  }

  if (denied)
    return (
      <Surface variant="elevated" className="p-8 text-center" role="alert">
        <h1 className="text-xl font-bold text-slate-900">Admin access required.</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your authenticated account is not authorized to view audit logs.
        </p>
      </Surface>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Insights & Security"
        title="Administrative Audit Logs"
        description="Immutable, append-only security log of administrative actions, config mutations, and manual operations."
      />

      <section aria-labelledby="audit-heading" className="space-y-4">
        <SectionHeader
          id="audit-heading"
          title="Security Event Trail"
          description="Chronological ledger of operational events."
        />

        <Surface variant="elevated" className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor ID</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logsPage!.content.map((log: AdminAuditEvent) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-semibold text-slate-900">{log.eventType}</td>
                    <td className="p-4 font-mono text-xs text-slate-600">{log.adminUserId}</td>
                    <td className="p-4 font-mono text-xs text-slate-700">
                      {log.targetSourceId ? `${log.targetSourceId}` : "—"}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {formatPublishedAt(log.createdAt)}
                    </td>
                    <td className="p-4 text-xs">
                      {log.metadata ? (
                        <pre className="max-w-xs overflow-x-auto rounded-md bg-slate-100 p-2 font-mono text-xs text-slate-800">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {logsPage!.content.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No audit events recorded.
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
            Showing page <span className="font-semibold text-slate-900">{logsPage!.page + 1}</span> of{" "}
            <span className="font-semibold text-slate-900">{logsPage!.totalPages}</span> (
            {logsPage!.totalElements} total)
          </p>
          <div className="flex gap-2">
            {!logsPage!.first && (
              <a
                href={`?page=${logsPage!.page - 1}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </a>
            )}
            {!logsPage!.last && (
              <a
                href={`?page=${logsPage!.page + 1}`}
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
