/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUsersSummary, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Users | Admin" };

export default async function AdminUsersPage() {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/users");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/users");

  let userSummary: any;
  let denied = false;
  
  try {
    await getAdminMe(token);
    userSummary = await getAdminUsersSummary(token);
  } catch (error: any) {
    if (error?.status === 401) redirect("/auth/login?next=/admin/users");
    if (error?.status === 403) denied = true;
    else throw error;
  }

  if (denied) return <div className="state-panel" role="alert"><h1 className="text-2xl font-bold text-slate-950">Admin access required.</h1></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">User Metrics</h1>
        <p className="page-intro">Aggregated engagement and registration numbers (PII is omitted).</p>
      </div>

      <section aria-labelledby="users-overview">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <dt className="text-sm font-semibold text-slate-500">Registered Users</dt>
            <dd className="mt-2 text-3xl font-black text-slate-950">{userSummary.totalProfiles.toLocaleString()}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <dt className="text-sm font-semibold text-slate-500">Total Bookmarks</dt>
            <dd className="mt-2 text-3xl font-black text-slate-950">{userSummary.totalBookmarks.toLocaleString()}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <dt className="text-sm font-semibold text-slate-500">Total Follows</dt>
            <dd className="mt-2 text-3xl font-black text-slate-950">{userSummary.totalFollows.toLocaleString()}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
