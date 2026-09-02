import { AuthForm } from "@/components/auth-form";
import { safeNextPath } from "@/lib/safe-redirect";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const query = await searchParams;
  return <AuthForm mode="login" next={safeNextPath(query.next)} />;
}
