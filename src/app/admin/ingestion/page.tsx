import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminIngestionSources, getAdminIngestionRuns, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { updateIngestionSettings, triggerIngestionRun } from "@/app/admin-actions";
import { AdminIngestionDashboard } from "@/components/admin-ingestion-dashboard";
import { ApiError } from "@/lib/api/client";
import type { AdminIngestionSource, AdminRunHistoryResponse, PagedResponse } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ingestion Controls | Admin" };

export default async function AdminIngestionPage() {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/ingestion");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/ingestion");
  
  let sources: AdminIngestionSource[];
  let runs: PagedResponse<AdminRunHistoryResponse>;
  let denied = false;
  try {
    await getAdminMe(token);
    [sources, runs] = await Promise.all([
      getAdminIngestionSources(token) as Promise<AdminIngestionSource[]>,
      getAdminIngestionRuns(token)
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth/login?next=/admin/ingestion");
    if (error instanceof ApiError && error.status === 403) {
      denied = true;
    } else {
      throw error;
    }
  }
  
  if (denied) return <div className="state-panel" role="alert"><h1 className="text-2xl font-bold text-slate-950">Admin access required.</h1><p className="mt-2 text-slate-600">Your authenticated account is not configured as an administrator.</p></div>;
  
  return <AdminIngestionDashboard sources={sources!} runs={runs!} updateSettings={updateIngestionSettings} triggerRun={triggerIngestionRun} />;
}
