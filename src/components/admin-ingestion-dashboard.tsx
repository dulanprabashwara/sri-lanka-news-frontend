"use client";

import { useState } from "react";
import { formatPublishedAt } from "@/lib/format";
import type { AdminIngestionSource, AdminRunHistoryResponse, PagedResponse } from "@/types/api";

export function AdminIngestionDashboard({ sources, runs, updateSettings, triggerRun }: {
  sources: AdminIngestionSource[];
  runs: PagedResponse<AdminRunHistoryResponse>;
  updateSettings: (slug: string, settings: { enabled: boolean; intervalMinutes: number; jitterSeconds: number }) => Promise<void>;
  triggerRun: (slug: string) => Promise<void>;
}) {
  const [editingSource, setEditingSource] = useState<AdminIngestionSource | null>(null);
  const [triggeringSlug, setTriggeringSlug] = useState<string | null>(null);

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "HEALTHY": return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Healthy</span>;
      case "WARNING": return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Warning</span>;
      case "STALE": return <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-800 ring-1 ring-inset ring-orange-600/20">Stale</span>;
      case "FAILING": return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Failing</span>;
      case "PAUSED": return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Paused</span>;
      case "NEVER_RUN": return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Never Run</span>;
      default: return null;
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
    <div className="space-y-10">
      <header><p className="eyebrow">Operations</p><h1 className="page-title">Ingestion Controls</h1>
        <p className="page-intro">Manage source scraping schedules, trigger manual runs, and monitor ingestion health.</p></header>
      
      <section aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="text-xl font-bold text-slate-950">Active Sources</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Source</th>
                <th className="p-4">Health</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Last Run</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.sourceSlug} className="border-t border-slate-100">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{source.displayName}</div>
                    <div className="text-xs text-slate-500">{source.sourceSlug}</div>
                  </td>
                  <td className="p-4">{getHealthBadge(source.health)}</td>
                  <td className="p-4">
                    {source.enabled ? (
                      <span className="text-slate-900">Every {source.intervalMinutes}m</span>
                    ) : (
                      <span className="text-slate-500">Disabled</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">
                    <div><span className="font-semibold">Attempt:</span> {source.lastAttemptAt ? formatPublishedAt(source.lastAttemptAt) : "Never"}</div>
                    <div><span className="font-semibold">Success:</span> {source.lastSuccessAt ? formatPublishedAt(source.lastSuccessAt) : "Never"}</div>
                  </td>
                  <td className="p-4 space-x-2 flex">
                    <button onClick={() => setEditingSource(source)} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">Configure</button>
                    <button onClick={() => handleTrigger(source.sourceSlug)} disabled={triggeringSlug === source.sourceSlug} className="rounded-lg bg-teal-600 px-3 py-1.5 font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
                      {triggeringSlug === source.sourceSlug ? "Triggering..." : "Run Now"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="runs-heading">
        <h2 id="runs-heading" className="text-xl font-bold text-slate-950">Recent Runs History</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Run ID</th>
                <th className="p-4">Source</th>
                <th className="p-4">Trigger</th>
                <th className="p-4">Status</th>
                <th className="p-4">Started</th>
                <th className="p-4">Counters (D/S/C/F)</th>
              </tr>
            </thead>
            <tbody>
              {runs.content.map((run) => (
                <tr key={run.runId} className="border-t border-slate-100">
                  <td className="p-4 font-mono text-xs text-slate-500">{run.runId}</td>
                  <td className="p-4 font-semibold text-slate-900">{run.sourceSlug}</td>
                  <td className="p-4">{run.triggerType}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      run.status === 'COMPLETED' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                      run.status === 'FAILED' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                      'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                    }`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{run.startedAt ? formatPublishedAt(run.startedAt) : "Pending"}</td>
                  <td className="p-4 text-slate-500">
                    {run.articlesDiscovered ?? 0} / {run.articlesSubmitted ?? 0} / {run.articlesSucceeded ?? 0} / {run.articlesFailed ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editingSource && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Configure {editingSource.displayName}</h3>
            <form action={async (formData) => {
              try {
                const enabled = formData.get("enabled") === "on";
                const intervalMinutes = parseInt(formData.get("intervalMinutes") as string, 10);
                const jitterSeconds = parseInt(formData.get("jitterSeconds") as string, 10);
                await updateSettings(editingSource.sourceSlug, { enabled, intervalMinutes, jitterSeconds });
                setEditingSource(null);
              } catch (e) {
                console.error("Failed to update settings:", e);
                alert(e instanceof Error ? e.message : "Failed to update settings. Please check your inputs.");
              }
            }} className="mt-4 space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="enabled" defaultChecked={editingSource.enabled} className="rounded border-slate-300 text-teal-600 focus:ring-teal-600" />
                <span className="text-sm font-medium text-slate-900">Enable automated scheduling</span>
              </label>
              <div>
                <label htmlFor="intervalMinutes" className="block text-sm font-medium text-slate-900">Interval (Minutes)</label>
                <input type="number" name="intervalMinutes" id="intervalMinutes" defaultValue={editingSource.intervalMinutes} min={5} max={1440} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val > 0) {
                    const maxJitter = Math.min(300, (val * 60) - 1);
                    const jitterInput = e.target.form?.elements.namedItem("jitterSeconds") as HTMLInputElement;
                    if (jitterInput) {
                      jitterInput.max = String(maxJitter);
                      if (parseInt(jitterInput.value, 10) > maxJitter) {
                        jitterInput.value = String(maxJitter);
                      }
                    }
                  }
                }} />
              </div>
              <div>
                <label htmlFor="jitterSeconds" className="block text-sm font-medium text-slate-900">Jitter (Seconds)</label>
                <input type="number" name="jitterSeconds" id="jitterSeconds" defaultValue={editingSource.jitterSeconds} min={0} max={Math.min(300, (editingSource.intervalMinutes * 60) - 1)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingSource(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
