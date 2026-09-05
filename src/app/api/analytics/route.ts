import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/config/env';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // 1. Check for explicit Authorization header (from fetch with keepalive)
    let authToken = req.headers.get('authorization');

    // 2. If no explicit header, extract JWT from Supabase cookie (sendBeacon path)
    if (!authToken) {
      try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { getAll: () => cookieStore.getAll() } }
        );
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          authToken = `Bearer ${session.access_token}`;
        }
      } catch {
        // Guest request — no token available, continue without auth
      }
    }

    // Forward the payload to the backend — never log authToken
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = authToken;
    }

    await fetch(`${getApiBaseUrl()}/api/v1/analytics/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    return NextResponse.json({ success: true });
  } catch {
    // Silent fail for analytics so we don't break the frontend client
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
