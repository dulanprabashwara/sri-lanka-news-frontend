import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const next = safeNextPath(request.nextUrl.searchParams.get("next"), "/");
  return NextResponse.redirect(new URL(next, request.url), 303);
}
