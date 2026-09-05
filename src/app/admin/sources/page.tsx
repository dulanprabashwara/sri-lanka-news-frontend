/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSources, getAdminMe } from "@/lib/api/admin";
import { getValidatedAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sources | Admin" };

export default async function AdminSourcesPage() {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin/sources");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin/sources");

  let sources;
  let denied = false;
  
  try {
    await getAdminMe(token);
    sources = await getAdminSources(token);
  } catch (error: any) {
    if (error?.status === 401) redirect("/auth/login?next=/admin/sources");
    if (error?.status === 403) denied = true;
    else throw error;
  }

  if (denied) return <div className="state-panel" role="alert"><h1 className="text-2xl font-bold text-slate-950">Admin access required.</h1></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Sources</h1>
        <p className="page-intro">Configured publishers and ingestion targets.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4">Publisher</th>
              <th className="p-4">Language</th>
              <th className="p-4">Ingestion</th>
              <th className="p-4">Articles</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {sources!.map((source) => (
              <tr key={source.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4">
                  <a href={source.baseUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800">
                    {source.name}
                  </a>
                  <div className="text-xs text-slate-500">{source.slug}</div>
                </td>
                <td className="p-4 uppercase text-slate-600 font-medium">{source.defaultLanguage}</td>
                <td className="p-4 text-slate-600">{source.ingestionType}</td>
                <td className="p-4 font-medium">{source.articleCount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    source.enabled ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}>
                    {source.enabled ? "Enabled" : "Unavailable"}
                  </span>
                </td>
              </tr>
            ))}
            {sources!.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No sources found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
