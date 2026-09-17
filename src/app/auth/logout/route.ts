import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { createLogoutRedirectResponse } from "@/lib/logout-response";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

async function handleLogout(request: NextRequest) {
  const response = createLogoutRedirectResponse(
    request.nextUrl.searchParams.get("next"),
  );

  if (isSupabaseConfigured()) {
    try {
      const { url, publishableKey } = getSupabaseConfig();
      const supabase = createServerClient(url, publishableKey, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });
      await supabase.auth.signOut();
    } catch {
      // Continue clearing remaining auth cookies defensively below
    }
  }

  // Defensively expire all remaining Supabase cookies
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.includes("sb-") || cookie.name.includes("supabase")) {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  });

  return response;
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}
