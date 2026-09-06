import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { ApiError } from "@/lib/api/client";
import { getAdminMe, getAdminOverview } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { retryFailedArticle } from "@/app/admin-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin");
  let dashboard;
  let denied = false;
  try {
    await getAdminMe(token);
    const overview = await getAdminOverview(token);
    dashboard = { overview };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth/login?next=/admin");
    if (error instanceof ApiError && error.status === 403) {
      denied = true;
    } else {
      throw error;
    }
  }
  if (denied) return <div className="state-panel" role="alert"><h1 className="text-2xl font-bold text-slate-950">Admin access required.</h1><p className="mt-2 text-slate-600">Your authenticated account is not configured as an administrator.</p></div>;
  return <AdminDashboard overview={dashboard!.overview} retryAction={retryFailedArticle} />;
}
