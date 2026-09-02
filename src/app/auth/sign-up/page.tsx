import { AuthForm } from "@/components/auth-form";
import { safeNextPath } from "@/lib/safe-redirect";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const query = await searchParams;
  return <AuthForm mode="sign-up" next={safeNextPath(query.next)} />;
}
