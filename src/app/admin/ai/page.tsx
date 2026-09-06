/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminAiOverview, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI Operations | Admin" };

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

  if (denied)
    return (
      <Surface variant="elevated" className="p-8 text-center" role="alert">
        <h1 className="text-xl font-bold text-slate-900">Admin access required.</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your authenticated account is not authorized to access AI metrics.
        </p>
      </Surface>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content Intelligence"
        title="AI Processing Operations"
        description="Monitor generative AI enrichment processing pipelines, error rates, and model configurations."
      />

      <section aria-labelledby="enrichment-heading" className="space-y-4">
        <SectionHeader
          id="enrichment-heading"
          title="Enrichment Pipeline Status"
          description="Operational metrics for article summary, entity extraction, and translation pipelines."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Surface variant="elevated" className="p-5">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Enrichments
            </dt>
            <dd className="mt-2 text-3xl font-black text-slate-900">
              {aiOverview.enrichment.completed.toLocaleString()}
            </dd>
          </Surface>

          <Surface variant="elevated" className="p-5">
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Retrying Jobs
              </dt>
              <StatusBadge status="warning" label="Retrying" />
            </div>
            <dd className="mt-2 text-3xl font-black text-amber-700">
              {aiOverview.enrichment.retrying.toLocaleString()}
            </dd>
          </Surface>

          <Surface variant="elevated" className="p-5 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Failed Processing
              </dt>
              <StatusBadge status="danger" label="Failed" />
            </div>
            <dd className="mt-2 text-3xl font-black text-red-700">
              {aiOverview.enrichment.failed.toLocaleString()}
            </dd>
          </Surface>
        </div>
      </section>

      <section aria-labelledby="provider-heading" className="space-y-4">
        <SectionHeader
          id="provider-heading"
          title="Provider Configuration"
          description="Model and inference deployment metadata."
        />

        <Surface variant="elevated" className="p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-900">Configured AI Model Provider</h3>
            <StatusBadge
              status={aiOverview.provider.configured ? "success" : "neutral"}
              label={aiOverview.provider.configured ? "Configured" : "Not Configured"}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Provider Name
              </p>
              <p className="text-sm font-semibold text-slate-900">{aiOverview.provider.providerName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Inference Model
              </p>
              <p className="text-sm font-mono font-semibold text-slate-900">{aiOverview.provider.modelName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Embedding Model
              </p>
              <p className="text-sm font-mono font-semibold text-slate-900">{aiOverview.provider.embeddingModelName}</p>
            </div>
          </div>
        </Surface>
      </section>
    </div>
  );
}
