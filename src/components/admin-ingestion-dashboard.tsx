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

      <section aria-labelledby="sources-heading" className="space-y-4">
        <SectionHeader
          id="sources-heading"
          title="Active Publisher Sources"
          description="Configured automated scraping targets and interval schedules."
        />

        <Surface variant="elevated" className="overflow-hidden p-0">
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
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          Configure
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTrigger(source.sourceSlug)}
                          disabled={triggeringSlug === source.sourceSlug}
                          className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                        >
                          <Play className="h-3.5 w-3.5" />
                          {triggeringSlug === source.sourceSlug ? "Triggering..." : "Run Now"}
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

        <Surface variant="elevated" className="overflow-hidden p-0">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Configure {editingSource.displayName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSource(null)}
                className="text-slate-400 hover:text-slate-600"
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
                  className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
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
                  className="mt-1 block w-full rounded-lg border-slate-300 text-sm shadow-xs focus:border-teal-500 focus:ring-teal-500"
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
                  className="mt-1 block w-full rounded-lg border-slate-300 text-sm shadow-xs focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSource(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
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
