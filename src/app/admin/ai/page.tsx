/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminAiOverview, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI Metrics | Admin" };

export default async function AdminAiPage() {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/ai");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/ai");

  let aiOverview: any;
  let denied = false;
  
  try {
    await getAdminMe(token);
    aiOverview = await getAdminAiOverview(token);
  } catch (error: any) {
    if (error?.status === 401) redirect("/auth/login?next=/admin/ai");
    if (error?.status === 403) denied = true;
    else throw error;
  }

  if (denied) return <div className="state-panel" role="alert"><h1 className="text-2xl font-bold text-slate-950">Admin access required.</h1></div>;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="page-title">AI Processing Metrics</h1>
        <p className="page-intro">Overview of generative AI usage and current status.</p>
      </header>

      <section aria-labelledby="enrichment-heading">
        <h2 id="enrichment-heading" className="text-xl font-bold text-slate-950">Enrichment Status</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <dt className="text-sm font-semibold text-slate-500">Completed Enrichments</dt>
            <dd className="mt-2 text-3xl font-black text-slate-950">{aiOverview.enrichment.completed.toLocaleString()}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <dt className="text-sm font-semibold text-slate-500">Retrying</dt>
            <dd className="mt-2 text-3xl font-black text-amber-600">{aiOverview.enrichment.retrying.toLocaleString()}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-red-500">
            <dt className="text-sm font-semibold text-slate-500">Failed Processing</dt>
            <dd className="mt-2 text-3xl font-black text-red-600">{aiOverview.enrichment.failed.toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="provider-heading">
        <h2 id="provider-heading" className="text-xl font-bold text-slate-950">Provider Configuration</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Current AI Provider</h3>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${aiOverview.provider.configured ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
              {aiOverview.provider.configured ? 'Configured' : 'Not Configured'}
            </span>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Provider Name</p>
              <p className="text-base text-slate-900">{aiOverview.provider.providerName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Inference Model</p>
              <p className="text-slate-900 font-mono text-sm">{aiOverview.provider.modelName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Embedding Model</p>
              <p className="text-slate-900 font-mono text-sm">{aiOverview.provider.embeddingModelName}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
