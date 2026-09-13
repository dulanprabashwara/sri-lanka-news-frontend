import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

const PROTECTED_PATHS = new Set(["/notifications", "/account/privacy"]);

export function requiresAuthentication(pathname: string) {
  return PROTECTED_PATHS.has(pathname);
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return requiresAuthentication(request.nextUrl.pathname)
      ? redirectToLogin(request)
      : NextResponse.next({ request });
  }
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headersToSet ?? {}).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims();
  if (
    requiresAuthentication(request.nextUrl.pathname) &&
    (error || !data?.claims?.sub)
  ) {
    return redirectToLogin(request);
  }
  return response;
}
