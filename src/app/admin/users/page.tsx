import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUsersSummary, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { Users, Bookmark, Heart } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "User Metrics | Admin" };

export default async function AdminUsersPage() {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/users");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/users");

  let metrics;
  let denied = false;

  try {
    await getAdminMe(token);
    metrics = await getAdminUsersSummary(token);
  } catch (error: any) {
    if (error?.status === 401) redirect("/auth/login?next=/admin/users");
    if (error?.status === 403) denied = true;
    else throw error;
  }

  if (denied)
    return (
      <Surface variant="elevated" className="p-8 text-center" role="alert">
        <h1 className="text-xl font-bold text-slate-900">Admin access required.</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your authenticated account is not authorized to access user metrics.
        </p>
      </Surface>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Insights & Security"
        title="User & Personalization Metrics"
        description="Aggregate statistics for user profile registrations, saved bookmarks, and followed news sources (strictly non-identifying)."
      />

      <section aria-labelledby="user-metrics-heading" className="space-y-4">
        <SectionHeader
          id="user-metrics-heading"
          title="Platform User Aggregates"
          description="Total account profile counts and personalization activity across all readers."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Surface variant="elevated" className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
                <Users className="h-4 w-4" />
              </div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Profiles
              </dt>
            </div>
            <dd className="mt-4 text-3xl font-black text-slate-900">
              {metrics!.totalProfiles.toLocaleString()}
            </dd>
          </Surface>

          <Surface variant="elevated" className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                <Bookmark className="h-4 w-4" />
              </div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Bookmarks
              </dt>
            </div>
            <dd className="mt-4 text-3xl font-black text-slate-900">
              {metrics!.totalBookmarks.toLocaleString()}
            </dd>
          </Surface>

          <Surface variant="elevated" className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2 text-red-700">
                <Heart className="h-4 w-4" />
              </div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Source Follows
              </dt>
            </div>
            <dd className="mt-4 text-3xl font-black text-slate-900">
              {metrics!.totalFollows.toLocaleString()}
            </dd>
          </Surface>
        </div>
      </section>
    </div>
  );
}
