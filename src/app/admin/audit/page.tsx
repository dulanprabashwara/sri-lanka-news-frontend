import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminAuditEvents, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { formatPublishedAt } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Audit Logs | Admin" };

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/audit");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/audit");

  const page = searchParams.page ? parseInt(searchParams.page, 10) : 0;
  let auditPage;
  let denied = false;
  
  try {
    await getAdminMe(token);
    auditPage = await getAdminAuditEvents(token, page, 50);
  } catch (error: any) {
    if (error?.status === 401) redirect("/auth/login?next=/admin/audit");
    if (error?.status === 403) denied = true;
    else throw error;
  }

  if (denied) return <div className="state-panel" role="alert"><h1 className="text-2xl font-bold text-slate-950">Admin access required.</h1></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-intro">Recent administrative actions and system events.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Admin User ID</th>
              <th className="p-4">Event Type</th>
              <th className="p-4">Target Source</th>
              <th className="p-4">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {auditPage!.content.map((event) => (
              <tr key={event.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-slate-500 whitespace-nowrap">{formatPublishedAt(event.createdAt)}</td>
                <td className="p-4 font-mono text-xs text-slate-600">{event.adminUserId}</td>
                <td className="p-4">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {event.eventType}
                  </span>
                </td>
                <td className="p-4 text-slate-600 font-mono text-xs">{event.targetSourceId || "—"}</td>
                <td className="p-4">
                  <pre className="text-xs text-slate-500 max-w-xs overflow-hidden text-ellipsis">
                    {event.metadata ? JSON.stringify(event.metadata) : "—"}
                  </pre>
                </td>
              </tr>
            ))}
            {auditPage!.content.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No audit events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Showing page {auditPage!.page + 1} of {auditPage!.totalPages} ({auditPage!.totalElements} total)
        </div>
        <div className="flex gap-2">
          {!auditPage!.first && (
            <a href={`?page=${auditPage!.page - 1}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">Previous</a>
          )}
          {!auditPage!.last && (
            <a href={`?page=${auditPage!.page + 1}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">Next</a>
          )}
        </div>
      </div>
    </div>
  );
}
