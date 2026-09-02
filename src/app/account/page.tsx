import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/me";
import { getValidatedAuth } from "@/lib/auth";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const parameters = await searchParams;
  const language = readDisplayLanguage(parameters.lang);
  const auth = await getValidatedAuth();
  if (!auth) {
    const accountPath = withDisplayLanguage("/account", language);
    redirect(withDisplayLanguage(`/auth/login?next=${encodeURIComponent(accountPath)}`, language));
  }
  const { data: sessionData } = await auth.supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) redirect("/auth/login?next=/account");

  let user;
  try {
    user = await getCurrentUser(accessToken);
  } catch (cause) {
    if (cause instanceof ApiError && cause.status === 401) redirect("/auth/login?next=/account");
    throw cause;
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-950">Account</h1>
      <p className="mt-3 text-sm font-semibold text-teal-800">Authenticated</p>
      <dl className="mt-6 grid gap-2">
        <dt className="text-sm font-semibold text-slate-500">Email</dt>
        <dd className="text-slate-900">{user.email ?? "Not available"}</dd>
      </dl>
      <form action={`/auth/logout?next=${encodeURIComponent(withDisplayLanguage("/", language))}`} method="post" className="mt-8">
        <button className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">Sign out</button>
      </form>
    </section>
  );
}
