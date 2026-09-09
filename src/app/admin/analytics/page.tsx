/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAdminAnalyticsOverview,
  getAdminAnalyticsTimeseries,
  getAdminAnalyticsContent,
  getAdminAnalyticsSections,
} from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { Users, BookOpen, Activity, Search, Bell, Star, TrendingUp } from "lucide-react";

const DATE_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const;

const SEARCH_TYPES = ["SEARCH_VIEW", "SEARCH_EXECUTED", "SEARCH_RESULT_CLICK"];
const RECOMMENDATION_TYPES = ["FOR_YOU_VIEW", "FOR_YOU_CLICK", "TRENDING_VIEW", "TRENDING_CLICK"];
const NOTIFICATION_TYPES = [
  "NOTIFICATION_CREATED",
  "NOTIFICATION_READ",
  "NOTIFICATION_EMAIL_SENT",
  "NOTIFICATION_EMAIL_FAILED",
];
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Unauthorized");
      const token = session.access_token;

      const [
        ovData,
        tsData,
        articleData,
        sourceData,
        catData,
        searchData,
        recoData,
        notifData,
        srcMetricData,
      ] = await Promise.all([
        getAdminAnalyticsOverview(token, rangeDays),
        getAdminAnalyticsTimeseries(token, rangeDays, ["PAGE_VIEW", "ARTICLE_VIEW", "STORY_VIEW"]),
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(days);
  }, [days, loadData]);

  const handleRange = (d: number) => {
    setDays(d);
  };

  if (loading)
    return (
      <Surface variant="elevated" className="p-8 text-center text-slate-500">
        Loading aggregate analytics...
      </Surface>
    );

  if (error)
    return (
      <Surface variant="elevated" className="p-8 text-center text-red-600">
        Error loading analytics: {error}
      </Surface>
    );

  const notifCreated = notifMetrics["NOTIFICATION_CREATED"] || 0;
  const notifRead = notifMetrics["NOTIFICATION_READ"] || 0;
  const readRate = notifCreated > 0 ? Math.round((notifRead / notifCreated) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Full-Width Header Card with Date Range Actions */}
      <PageHeader
        eyebrow="Insights & Security"
        title="Platform Analytics"
        description="Aggregate operational metrics and readership trends (PII is completely omitted)."
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-2xs">
            {DATE_RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => handleRange(r.days)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  days === r.days
                    ? "bg-brand text-white shadow-2xs"
                    : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label="Unique Visitors" value={overview?.UNIQUE_VISITORS || 0} />
        <MetricCard icon={BookOpen} label="Page Views" value={overview?.PAGE_VIEW || 0} />
        <MetricCard icon={Activity} label="Article Views" value={overview?.ARTICLE_VIEW || 0} />
        <MetricCard icon={Star} label="Bookmarks Created" value={overview?.BOOKMARK_CREATED || 0} />
      </div>

      {/* Usage Over Time */}
      <section aria-labelledby="timeseries-heading" className="space-y-3">
        <SectionHeader
          id="timeseries-heading"
          title="Reader Engagement Over Time"
          description="Daily aggregate view volume across stories and articles."
        />
        <Surface variant="elevated" className="p-6">
          {timeseries.length > 0 ? (
            <div className="space-y-4">
              <div className="h-56 sm:h-64 flex items-end justify-center gap-3 sm:gap-6 border-b border-border pb-3 pt-6">
                {timeseries.map((day: any) => {
                  const maxVal = Math.max(...timeseries.map((d: any) => d.count || 0), 1);
                  const height = `${Math.max(((day.count || 0) / maxVal) * 100, 4)}%`;
                  const formattedDate = day.date
                    ? new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "";
                  return (
                    <div
                      key={day.date}
                      className="relative flex-1 max-w-16 sm:max-w-20 group h-full flex flex-col justify-end items-center"
                      title={`${day.date}: ${day.count} views`}
                    >
                      {/* Top value badge */}
                      <span className="mb-1 text-xs font-bold text-foreground-secondary group-hover:text-brand transition-colors">
                        {day.count || 0}
                      </span>
                      {/* Floating hover tooltip */}
                      <div className="absolute -top-6 hidden rounded-md bg-foreground px-2.5 py-1 text-xs font-bold text-white shadow-md group-hover:block z-10 whitespace-nowrap">
                        {day.count} views ({formattedDate})
                      </div>
                      <div
                        className="w-full bg-brand rounded-t-md opacity-85 group-hover:opacity-100 transition-all shadow-2xs"
                        style={{ height }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-3 sm:gap-6 text-xs font-semibold text-foreground-muted">
                {timeseries.map((day: any) => {
                  const formattedDate = day.date
                    ? new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : day.date;
                  return (
                    <div key={`lbl-${day.date}`} className="flex-1 max-w-16 sm:max-w-20 text-center truncate">
                      {formattedDate}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-foreground-muted text-sm">
              No trend data recorded for the selected date range.
            </div>
          )}
        </Surface>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Content */}
        <section aria-labelledby="content-heading" className="space-y-3">
          <SectionHeader id="content-heading" title="Top Articles" description="Most viewed news items." />
          <Surface variant="elevated" className="p-0 overflow-hidden">
            <TopList items={topArticles} />
          </Surface>
        </section>

        {/* Sources */}
        <section aria-labelledby="sources-analytics-heading" className="space-y-3">
          <SectionHeader id="sources-analytics-heading" title="Publisher Sources" description="Publisher engagement breakdown." />
          <Surface variant="elevated" className="p-6 space-y-4">
            <TopList items={topSources} />
            <div className="grid grid-cols-3 gap-3 text-center text-xs border-t border-slate-100 pt-4">
              <div>
                <div className="font-bold text-slate-900 text-sm">{sourceMetrics["ARTICLE_VIEW"] || 0}</div>
                <div className="text-slate-500 font-medium">Article Views</div>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{sourceMetrics["SOURCE_VIEW"] || 0}</div>
                <div className="text-slate-500 font-medium">Source Views</div>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{sourceMetrics["FOLLOW_CREATED"] || 0}</div>
                <div className="text-slate-500 font-medium">Source Follows</div>
              </div>
            </div>
          </Surface>
        </section>

        {/* Categories / Topics */}
        <section aria-labelledby="categories-heading" className="space-y-3">
          <SectionHeader id="categories-heading" title="Categories & Topics" description="Reader interest distribution." />
          <Surface variant="elevated" className="p-0 overflow-hidden">
            <TopList items={topCategories} />
          </Surface>
        </section>

        {/* Search */}
        <section aria-labelledby="search-heading" className="space-y-3">
          <SectionHeader id="search-heading" title="Search Engagement" description="Search usage statistics." />
          <Surface variant="elevated" className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <StatBox icon={Search} label="Searches Executed" value={searchMetrics["SEARCH_EXECUTED"] || 0} />
              <StatBox icon={Search} label="Search Views" value={searchMetrics["SEARCH_VIEW"] || 0} />
              <StatBox icon={Search} label="Result Clicks" value={searchMetrics["SEARCH_RESULT_CLICK"] || 0} />
              <StatBox
                icon={Search}
                label="Zero-Result Rate"
                value={
                  (searchMetrics["SEARCH_EXECUTED"] || 0) > 0
                    ? `${Math.round(
                        (1 - (searchMetrics["SEARCH_RESULT_CLICK"] || 0) / (searchMetrics["SEARCH_EXECUTED"] || 1)) *
                          100
                      )}%`
                    : "N/A"
                }
              />
            </div>
          </Surface>
        </section>

        {/* Recommendations */}
        <section aria-labelledby="reco-heading" className="space-y-3">
          <SectionHeader id="reco-heading" title="Recommendations" description="Discovery feature performance." />
          <Surface variant="elevated" className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <StatBox icon={Star} label="For You Views" value={recoMetrics["FOR_YOU_VIEW"] || 0} />
              <StatBox icon={Star} label="For You Clicks" value={recoMetrics["FOR_YOU_CLICK"] || 0} />
              <StatBox icon={TrendingUp} label="Trending Views" value={recoMetrics["TRENDING_VIEW"] || 0} />
              <StatBox icon={TrendingUp} label="Trending Clicks" value={recoMetrics["TRENDING_CLICK"] || 0} />
            </div>
          </Surface>
        </section>

        {/* Notifications */}
        <section aria-labelledby="notif-heading" className="space-y-3">
          <SectionHeader id="notif-heading" title="Notification Delivery" description="System notification metrics." />
          <Surface variant="elevated" className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <StatBox icon={Bell} label="Notifications Created" value={notifCreated} />
              <StatBox icon={Bell} label="Notifications Read" value={notifRead} />
              <StatBox icon={Bell} label="Read Rate" value={`${readRate}%`} />
              <StatBox icon={Bell} label="Emails Sent" value={notifMetrics["NOTIFICATION_EMAIL_SENT"] || 0} />
            </div>
          </Surface>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number | string;
}) {
  return (
    <Surface variant="elevated" className="p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-brand-soft/30 p-2 text-brand">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</h3>
      </div>
      <div className="mt-3 text-3xl font-black text-slate-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </Surface>
  );
}

function TopList({ items }: { items: any[] }) {
  if (!items?.length)
    return <div className="text-center text-slate-400 text-xs py-6">No aggregate data available</div>;
  return (
    <div className="divide-y divide-slate-100">
      {items.slice(0, 8).map((item: any, i: number) => (
        <div key={item._id || i} className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
            <span className="text-xs font-semibold text-slate-900 truncate">
              {item._id || "Unknown"}
            </span>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 shrink-0 ml-2">
            {item.views?.toLocaleString()} views
          </span>
        </div>
      ))}
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
      <Icon className="h-4 w-4 text-brand mx-auto mb-1" />
      <div className="text-lg font-black text-slate-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  );
}
