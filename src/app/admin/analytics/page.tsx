/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminAnalyticsOverview, getAdminAnalyticsTimeseries, getAdminAnalyticsContent, getAdminAnalyticsSections } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/client";
import { Users, BookOpen, Activity, Search, Bell, Star, TrendingUp } from "lucide-react";

const DATE_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const;

const SEARCH_TYPES = ["SEARCH_VIEW", "SEARCH_EXECUTED", "SEARCH_RESULT_CLICK"];
const RECOMMENDATION_TYPES = ["FOR_YOU_VIEW", "FOR_YOU_CLICK", "TRENDING_VIEW", "TRENDING_CLICK"];
const NOTIFICATION_TYPES = ["NOTIFICATION_CREATED", "NOTIFICATION_READ", "NOTIFICATION_EMAIL_SENT", "NOTIFICATION_EMAIL_FAILED"];
const SOURCE_TYPES = ["ARTICLE_VIEW", "SOURCE_VIEW", "FOLLOW_CREATED"];

export default function AdminAnalyticsDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [topArticles, setTopArticles] = useState<any[]>([]);
  const [topSources, setTopSources] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [searchMetrics, setSearchMetrics] = useState<Record<string, number>>({});
  const [recoMetrics, setRecoMetrics] = useState<Record<string, number>>({});
  const [notifMetrics, setNotifMetrics] = useState<Record<string, number>>({});
  const [sourceMetrics, setSourceMetrics] = useState<Record<string, number>>({});
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (rangeDays: number) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Unauthorized");
      const token = session.access_token;

      const [ovData, tsData, articleData, sourceData, catData, searchData, recoData, notifData, srcMetricData] = await Promise.all([
        getAdminAnalyticsOverview(token, rangeDays),
        getAdminAnalyticsTimeseries(token, rangeDays, ['PAGE_VIEW', 'ARTICLE_VIEW', 'STORY_VIEW']),
        getAdminAnalyticsContent(token, rangeDays, "ARTICLE"),
        getAdminAnalyticsContent(token, rangeDays, "SOURCE"),
        getAdminAnalyticsContent(token, rangeDays, "CATEGORY"),
        getAdminAnalyticsSections(token, rangeDays, SEARCH_TYPES),
        getAdminAnalyticsSections(token, rangeDays, RECOMMENDATION_TYPES),
        getAdminAnalyticsSections(token, rangeDays, NOTIFICATION_TYPES),
        getAdminAnalyticsSections(token, rangeDays, SOURCE_TYPES),
      ]);

      setOverview(ovData);
      setTimeseries(tsData);
      setTopArticles(articleData);
      setTopSources(sourceData);
      setTopCategories(catData);
      setSearchMetrics(searchData as Record<string, number>);
      setRecoMetrics(recoData as Record<string, number>);
      setNotifMetrics(notifData as Record<string, number>);
      setSourceMetrics(srcMetricData as Record<string, number>);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(days); }, [days, loadData]);

  const handleRange = (d: number) => { setDays(d); };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const notifCreated = notifMetrics["NOTIFICATION_CREATED"] || 0;
  const notifRead = notifMetrics["NOTIFICATION_READ"] || 0;
  const readRate = notifCreated > 0 ? Math.round((notifRead / notifCreated) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header + Date Range Controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => handleRange(r.days)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${days === r.days ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label="Unique Visitors" value={overview?.UNIQUE_VISITORS || 0} />
        <MetricCard icon={BookOpen} label="Page Views" value={overview?.PAGE_VIEW || 0} />
        <MetricCard icon={Activity} label="Article Views" value={overview?.ARTICLE_VIEW || 0} />
        <MetricCard icon={Star} label="Bookmarks" value={(overview?.BOOKMARK_CREATED || 0)} />
      </div>

      {/* Usage Over Time */}
      <Section title="Usage Over Time">
        <div className="h-48 flex items-end gap-1">
          {timeseries.length > 0 ? timeseries.map((day: any) => {
            const maxVal = Math.max(...timeseries.map((d: any) => (d.count || 0)), 1);
            const height = `${((day.count || 0) / maxVal) * 100}%`;
            return (
              <div key={day.date} className="relative flex-1 group h-full flex flex-col justify-end" title={`${day.date}: ${day.count} views`}>
                <div className="w-full bg-teal-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all" style={{ height }}></div>
              </div>
            );
          }) : <div className="w-full text-center text-slate-400 text-sm self-center">No trend data</div>}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Content */}
        <Section title="Top Content (Articles)">
          <TopList items={topArticles} />
        </Section>

        {/* Sources */}
        <Section title="Sources">
          <TopList items={topSources} />
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm border-t pt-3">
            <div><div className="font-bold text-slate-900">{sourceMetrics["ARTICLE_VIEW"] || 0}</div><div className="text-slate-500">Article Views</div></div>
            <div><div className="font-bold text-slate-900">{sourceMetrics["SOURCE_VIEW"] || 0}</div><div className="text-slate-500">Source Views</div></div>
            <div><div className="font-bold text-slate-900">{sourceMetrics["FOLLOW_CREATED"] || 0}</div><div className="text-slate-500">Follows</div></div>
          </div>
        </Section>

        {/* Categories / Topics */}
        <Section title="Categories / Topics">
          <TopList items={topCategories} />
        </Section>

        {/* Search */}
        <Section title="Search">
          <div className="grid grid-cols-2 gap-4 text-center">
            <StatBox icon={Search} label="Total Searches" value={searchMetrics["SEARCH_EXECUTED"] || 0} />
            <StatBox icon={Search} label="Search Views" value={searchMetrics["SEARCH_VIEW"] || 0} />
            <StatBox icon={Search} label="Result Clicks" value={searchMetrics["SEARCH_RESULT_CLICK"] || 0} />
            <StatBox icon={Search} label="Zero-Result Rate" value={
              (searchMetrics["SEARCH_EXECUTED"] || 0) > 0
                ? `${Math.round((1 - (searchMetrics["SEARCH_RESULT_CLICK"] || 0) / (searchMetrics["SEARCH_EXECUTED"] || 1)) * 100)}%`
                : "N/A"
            } />
          </div>
        </Section>

        {/* Recommendations */}
        <Section title="Recommendations">
          <div className="grid grid-cols-2 gap-4 text-center">
            <StatBox icon={Star} label="For You Views" value={recoMetrics["FOR_YOU_VIEW"] || 0} />
            <StatBox icon={Star} label="For You Clicks" value={recoMetrics["FOR_YOU_CLICK"] || 0} />
            <StatBox icon={TrendingUp} label="Trending Views" value={recoMetrics["TRENDING_VIEW"] || 0} />
            <StatBox icon={TrendingUp} label="Trending Clicks" value={recoMetrics["TRENDING_CLICK"] || 0} />
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <div className="grid grid-cols-2 gap-4 text-center">
            <StatBox icon={Bell} label="Created" value={notifCreated} />
            <StatBox icon={Bell} label="Read" value={notifRead} />
            <StatBox icon={Bell} label="Read Rate" value={`${readRate}%`} />
            <StatBox icon={Bell} label="Email Sent" value={notifMetrics["NOTIFICATION_EMAIL_SENT"] || 0} />
            <StatBox icon={Bell} label="Email Failed" value={notifMetrics["NOTIFICATION_EMAIL_FAILED"] || 0} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-teal-50 p-2 text-teal-600"><Icon className="h-5 w-5" /></div>
        <h3 className="text-sm font-medium text-slate-500">{label}</h3>
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900">{typeof value === "number" ? value.toLocaleString() : value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4"><h2 className="font-semibold text-slate-900">{title}</h2></div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TopList({ items }: { items: any[] }) {
  if (!items?.length) return <div className="text-center text-slate-400 text-sm py-4">No data available</div>;
  return (
    <div className="divide-y divide-slate-100 -mx-6 -mt-6">
      {items.slice(0, 10).map((item: any, i: number) => (
        <div key={item._id || i} className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
            <span className="text-sm font-medium text-slate-900 truncate max-w-xs">{item._id || "Unknown"}</span>
          </div>
          <span className="text-sm text-slate-500">{item.views?.toLocaleString()} views</span>
        </div>
      ))}
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <Icon className="h-4 w-4 text-slate-400 mx-auto mb-1" />
      <div className="text-lg font-bold text-slate-900">{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
