"use client";

import { useState } from "react";
import { formatPublishedAt } from "@/lib/format";
import type { AdminIngestionSource, AdminRunHistoryResponse, PagedResponse } from "@/types/api";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";
import { Play, Settings, X, Check } from "lucide-react";

export function AdminIngestionDashboard({
  sources,
  runs,
  updateSettings,
  triggerRun,
}: {
  sources: AdminIngestionSource[];
  runs: PagedResponse<AdminRunHistoryResponse>;
  updateSettings: (
    slug: string,
    settings: { enabled: boolean; intervalMinutes: number; jitterSeconds: number }
  ) => Promise<void>;
  triggerRun: (slug: string) => Promise<void>;
}) {
  const [editingSource, setEditingSource] = useState<AdminIngestionSource | null>(null);
  const [triggeringSlug, setTriggeringSlug] = useState<string | null>(null);

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "HEALTHY":
        return <StatusBadge status="success" label="Healthy" />;
      case "WARNING":
        return <StatusBadge status="warning" label="Warning" />;
      case "STALE":
        return <StatusBadge status="warning" label="Stale" />;
      case "FAILING":
        return <StatusBadge status="danger" label="Failing" />;
      case "PAUSED":
        return <StatusBadge status="neutral" label="Paused" />;
      case "NEVER_RUN":
        return <StatusBadge status="neutral" label="Never Run" />;
      default:
        return <StatusBadge status="neutral" label={health} />;
    }
  };

  const handleTrigger = async (slug: string) => {
    setTriggeringSlug(slug);
    try {
      await triggerRun(slug);
    } finally {
      setTriggeringSlug(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations Console"
        title="Ingestion Controls"
        description="Manage publisher scraping schedules, trigger manual queued ingestion runs, and monitor run execution history."
      />

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
          <dt className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Publishers</dt>
          <dd className="mt-1 font-serif text-2xl font-semibold text-foreground">{sources.length}</dd>
        </div>
        <div className="rounded-xl border border-success-border bg-success-soft/50 p-4 shadow-xs">
          <dt className="text-xs font-bold uppercase tracking-wider text-success">Scheduled</dt>
          <dd className="mt-1 font-serif text-2xl font-semibold text-foreground">{sources.filter((source) => source.enabled).length}</dd>
        </div>
        <div className="col-span-2 rounded-xl border border-border bg-surface-muted p-4 shadow-xs sm:col-span-1">
          <dt className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Paused</dt>
          <dd className="mt-1 font-serif text-2xl font-semibold text-foreground">{sources.filter((source) => !source.enabled).length}</dd>
        </div>
      </dl>

      <section aria-labelledby="sources-heading" className="space-y-4">
        <SectionHeader
          id="sources-heading"
          title="Publisher Sources"
          description="Configured scraping targets, including active schedules and retired ingestion sources."
        />

        <div aria-label="Publisher source cards" className="grid gap-3 lg:hidden">
          {sources.map((source) => (
            <article
              key={source.sourceSlug}
              className={`rounded-xl border bg-surface p-4 shadow-xs ${source.enabled ? "border-border" : "border-border bg-surface-muted/70"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground break-words">{source.displayName}</h3>
                  <p className="mt-0.5 break-all font-mono text-[0.68rem] text-foreground-muted">{source.sourceSlug}</p>
                </div>
                {getHealthBadge(source.health)}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-3 text-xs">
                <div>
                  <dt className="font-bold uppercase tracking-wide text-foreground-muted">Schedule</dt>
                  <dd className="mt-1 font-semibold text-foreground">{source.enabled ? `Every ${source.intervalMinutes}m` : "Disabled"}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-foreground-muted">Last success</dt>
                  <dd className="mt-1 text-foreground-secondary">{source.lastSuccessAt ? formatPublishedAt(source.lastSuccessAt) : "Never"}</dd>
                </div>
              </dl>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSource(source)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-3 text-xs font-bold text-foreground hover:border-brand hover:text-brand"
                >
                  <Settings className="size-4" aria-hidden="true" /> Configure
                </button>
                <button
                  type="button"
                  onClick={() => handleTrigger(source.sourceSlug)}
                  disabled={!source.enabled || triggeringSlug === source.sourceSlug}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-3 text-xs font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                >
                  <Play className="size-4" aria-hidden="true" />
                  {!source.enabled ? "Disabled" : triggeringSlug === source.sourceSlug ? "Triggering..." : "Run Now"}
                </button>
              </div>
            </article>
          ))}
        </div>

        <Surface variant="elevated" className="hidden overflow-hidden p-0 lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="p-4">Source</th>
                  <th className="p-4">Health</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Last Run Timestamps</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sources.map((source) => (
                  <tr key={source.sourceSlug} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{source.displayName}</p>
                      <p className="text-xs text-slate-400 font-mono">{source.sourceSlug}</p>
                    </td>
                    <td className="p-4">{getHealthBadge(source.health)}</td>
                    <td className="p-4">
                      {source.enabled ? (
                        <span className="font-medium text-slate-900">Every {source.intervalMinutes}m</span>
                      ) : (
                        <span className="text-slate-500">Disabled</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <div>
                        <span className="font-semibold text-slate-700">Attempt:</span>{" "}
                        {source.lastAttemptAt ? formatPublishedAt(source.lastAttemptAt) : "Never"}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Success:</span>{" "}
                        {source.lastSuccessAt ? formatPublishedAt(source.lastSuccessAt) : "Never"}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSource(source)}
                          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          Configure
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTrigger(source.sourceSlug)}
                          disabled={!source.enabled || triggeringSlug === source.sourceSlug}
                          className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
                        >
                          <Play className="h-3.5 w-3.5" />
                          {!source.enabled
                            ? "Disabled"
                            : triggeringSlug === source.sourceSlug
                              ? "Triggering..."
                              : "Run Now"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </section>

      <section aria-labelledby="runs-heading" className="space-y-4">
        <SectionHeader
          id="runs-heading"
          title="Recent Run History"
          description="Log of recent scheduled and manual ingestion executions with article discovery metrics."
        />

        <div className="grid gap-3 lg:hidden">
          {runs.content.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface p-5 text-sm text-foreground-secondary">No ingestion runs have been recorded yet.</p>
          ) : runs.content.map((run) => (
            <article key={run.runId} className="rounded-xl border border-border bg-surface p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground break-words">{run.sourceSlug}</h3>
                  <p className="mt-1 break-all font-mono text-[0.68rem] text-foreground-muted">{run.runId}</p>
                </div>
                <StatusBadge status={run.status === "COMPLETED" ? "success" : run.status === "FAILED" ? "danger" : "warning"} label={run.status} />
              </div>
              <p className="mt-3 text-xs text-foreground-secondary">{run.triggerType} · {run.startedAt ? formatPublishedAt(run.startedAt) : "Pending"}</p>
              <dl className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-surface-muted p-3 text-center">
                {[
                  ["Found", run.articlesDiscovered], ["Sent", run.articlesSubmitted],
                  ["OK", run.articlesSucceeded], ["Failed", run.articlesFailed],
                ].map(([label, value]) => (
                  <div key={String(label)}><dt className="text-[0.62rem] font-bold uppercase text-foreground-muted">{label}</dt><dd className="mt-1 font-bold text-foreground">{value ?? 0}</dd></div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <Surface variant="elevated" className="hidden overflow-hidden p-0 lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="p-4">Run ID</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Trigger</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Started</th>
                  <th className="p-4">Counters (Discovered / Submitted / Succeeded / Failed)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {runs.content.map((run) => (
                  <tr key={run.runId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-500">{run.runId}</td>
                    <td className="p-4 font-semibold text-slate-900">{run.sourceSlug}</td>
                    <td className="p-4 text-xs font-medium text-slate-600">{run.triggerType}</td>
                    <td className="p-4">
                      <StatusBadge
                        status={
                          run.status === "COMPLETED"
                            ? "success"
                            : run.status === "FAILED"
                            ? "danger"
                            : "warning"
                        }
                        label={run.status}
                      />
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {run.startedAt ? formatPublishedAt(run.startedAt) : "Pending"}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-700 font-mono">
                      {run.articlesDiscovered ?? 0} / {run.articlesSubmitted ?? 0} /{" "}
                      {run.articlesSucceeded ?? 0} / {run.articlesFailed ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </section>

      {editingSource && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Configure ${editingSource.displayName}`}>
          <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Configure {editingSource.displayName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSource(null)}
                className="inline-flex size-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              action={async (formData) => {
                try {
                  const enabled = formData.get("enabled") === "on";
                  const intervalMinutes = parseInt(formData.get("intervalMinutes") as string, 10);
                  const jitterSeconds = parseInt(formData.get("jitterSeconds") as string, 10);
                  await updateSettings(editingSource.sourceSlug, {
                    enabled,
                    intervalMinutes,
                    jitterSeconds,
                  });
                  setEditingSource(null);
                } catch (e) {
                  console.error("Failed to update settings:", e);
                  alert(e instanceof Error ? e.message : "Failed to update settings.");
                }
              }}
              className="space-y-4"
            >
              <label className="flex items-center space-x-2 text-sm font-medium text-slate-900">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={editingSource.enabled}
                  className="rounded border-slate-300 text-brand focus:ring-brand"
                />
                <span>Enable automated scheduling</span>
              </label>

              <div>
                <label
                  htmlFor="intervalMinutes"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Interval (Minutes)
                </label>
                <input
                  type="number"
                  name="intervalMinutes"
                  id="intervalMinutes"
                  defaultValue={editingSource.intervalMinutes}
                  min={5}
                  max={1440}
                  required
                  className="mt-1 block w-full rounded-lg border-slate-300 text-sm shadow-xs focus:border-brand focus:ring-brand"
                />
              </div>

              <div>
                <label
                  htmlFor="jitterSeconds"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Jitter (Seconds)
                </label>
                <input
                  type="number"
                  name="jitterSeconds"
                  id="jitterSeconds"
                  defaultValue={editingSource.jitterSeconds}
                  min={0}
                  max={Math.min(300, editingSource.intervalMinutes * 60 - 1)}
                  required
                  className="mt-1 block w-full rounded-lg border-slate-300 text-sm shadow-xs focus:border-brand focus:ring-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSource(null)}
                  className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-hover"
                >
                  <Check className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
