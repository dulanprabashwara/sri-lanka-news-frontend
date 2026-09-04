import { AdminNav } from "@/components/admin-nav";
import { getValidatedAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full md:w-64 shrink-0">
          <AdminNav />
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
