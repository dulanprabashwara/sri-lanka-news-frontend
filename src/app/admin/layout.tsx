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
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-10">
        <aside className="w-full lg:sticky lg:top-[7rem]">
          <AdminNav />
        </aside>
        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
