/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminAiOverview, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AdminAiModelProvider, AdminAiOverviewResponse } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI Operations | Admin" };

export default async function AdminAiPage() {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/ai");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/ai");

  let aiOverview: AdminAiOverviewResponse | null = null;
  let denied = false;

  try {
    await getAdminMe(token);
    aiOverview = await getAdminAiOverview(token);
  } catch (error: any) {
    if (error?.status === 401) redirect("/auth/login?next=/admin/ai");
    if (error?.status === 403) denied = true;
    else throw error;
  }

  if (denied || !aiOverview)
    return (
      <Surface variant="elevated" className="p-8 text-center" role="alert">
        <h1 className="text-xl font-bold text-slate-900">Admin access required.</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your authenticated account is not authorized to access AI metrics.
        </p>
      </Surface>
    );

  const providers: AdminAiModelProvider[] = aiOverview.providers ?? [];

  const enrichmentProviders = providers.filter((p) => p.pipeline === "ENRICHMENT");
  const translationProviders = providers.filter((p) => p.pipeline === "TRANSLATION");
  const embeddingProviders = providers.filter((p) => p.pipeline === "EMBEDDING");
  const qaProviders = providers.filter((p) => p.pipeline === "GROUNDED_QA");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content Intelligence"
        title="AI & Model Operations"
        description="Monitor generative AI enrichment pipelines, multilingual translation fallbacks, vector embeddings, and error metrics."
      />

      <section aria-labelledby="enrichment-heading" className="space-y-4">
        <SectionHeader
          id="enrichment-heading"
          title="Enrichment Pipeline Status"
          description="Operational metrics for article categorization, key entity extraction, and content enrichment."
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

      {/* Primary Provider Configuration */}
      <section aria-labelledby="provider-heading" className="space-y-4">
        <SectionHeader
          id="provider-heading"
          title="Primary AI Engine"
          description="Default inference deployment and embedding configurations."
        />

        <Surface variant="elevated" className="p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configured AI Model Provider</h3>
              <p className="text-xs text-slate-500 mt-0.5">Primary generative intelligence service</p>
            </div>
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

      {/* Model Pipelines: Enrichment & Fallback */}
      <section aria-labelledby="enrichment-models-heading" className="space-y-4">
        <SectionHeader
          id="enrichment-models-heading"
          title="Article Enrichment Models"
          description="Primary inference service and high-availability fallback providers for article metadata extraction."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {enrichmentProviders.map((item) => (
            <Surface key={item.id} variant="elevated" className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{item.name}</span>
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${item.role === "PRIMARY" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                      {item.role === "PRIMARY" ? "Primary" : "Fallback"}
                    </span>
                  </div>
                  <StatusBadge
                    status={item.configured ? "success" : "neutral"}
                    label={item.configured ? "Active" : "Not Configured"}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {item.role === "PRIMARY"
                    ? "Generates article summaries, categories, entities, and sentiment analysis."
                    : "Secondary fallback service invoked automatically if primary encounters rate limits or errors."}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Model ID</span>
                  <span className="font-mono font-semibold text-slate-800 break-all">{item.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Details</span>
                  <span className="text-slate-700 font-medium">{item.details}</span>
                </div>
              </div>
            </Surface>
          ))}
        </div>
      </section>

      {/* Model Pipelines: Translation & Fallback */}
      <section aria-labelledby="translation-models-heading" className="space-y-4">
        <SectionHeader
          id="translation-models-heading"
          title="Multilingual Translation Services"
          description="Neural and generative translation services for English, Sinhala (සිංහල), and Tamil (தமிழ்)."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {translationProviders.map((item) => (
            <Surface key={item.id} variant="elevated" className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{item.name}</span>
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${item.role === "PRIMARY" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                      {item.role === "PRIMARY" ? "Primary" : "Fallback"}
                    </span>
                  </div>
                  <StatusBadge
                    status={item.configured ? "success" : "neutral"}
                    label={item.configured ? "Active" : "Not Configured"}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {item.role === "PRIMARY"
                    ? "Translates article titles and summaries into Sinhala and Tamil with cultural nuance."
                    : "Microsoft Azure Cognitive Services Neural Machine Translation for high-availability fallback."}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Model / Version</span>
                  <span className="font-mono font-semibold text-slate-800">{item.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Deployment</span>
                  <span className="text-slate-700 font-medium">{item.details}</span>
                </div>
              </div>
            </Surface>
          ))}
        </div>
      </section>

      {/* Embeddings & Grounded QA */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Embeddings */}
        <section aria-labelledby="embedding-heading" className="space-y-4">
          <SectionHeader
            id="embedding-heading"
            title="Semantic Embeddings"
            description="Vector representation models for cross-lingual story clustering."
          />

          {embeddingProviders.map((item) => (
            <Surface key={item.id} variant="elevated" className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">{item.name}</span>
                <StatusBadge
                  status={item.configured ? "success" : "neutral"}
                  label={item.configured ? "Active" : "Not Configured"}
                />
              </div>
              <p className="text-xs text-slate-500">
                Powers dense vector clustering and multi-language semantic similarity matching across sources.
              </p>
              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Model</span>
                  <span className="font-mono font-semibold text-slate-800">{item.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Dimensions</span>
                  <span className="text-slate-700 font-medium">{item.details}</span>
                </div>
              </div>
            </Surface>
          ))}
        </section>

        {/* Grounded QA */}
        <section aria-labelledby="qa-heading" className="space-y-4">
          <SectionHeader
            id="qa-heading"
            title="Grounded Q&A (Ask Story)"
            description="Reader question answering grounded in verified article facts."
          />

          <div className="space-y-3">
            {qaProviders.map((item) => (
              <Surface key={item.id} variant="elevated" className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${item.role === "PRIMARY" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                      {item.role === "PRIMARY" ? "Primary" : "Fallback"}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-500 mt-1">{item.model}</p>
                </div>
                <StatusBadge
                  status={item.configured ? "success" : "neutral"}
                  label={item.configured ? "Active" : "Not Configured"}
                  size="sm"
                />
              </Surface>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
