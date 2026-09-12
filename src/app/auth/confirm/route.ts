import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import { getPreferences } from "@/lib/api/user";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data?.session?.access_token) {
        try {
          await getPreferences(data.session.access_token);
        } catch {
          // Profile provisioning is non-blocking for email confirmation flow
        }
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }
  return NextResponse.redirect(
    new URL("/auth/login?error=confirmation", request.url),
  );
}
