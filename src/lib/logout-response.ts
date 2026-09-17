import { NextResponse } from "next/server";
import { safeNextPath } from "./safe-redirect";

export function createLogoutRedirectResponse(next: string | null) {
  const location = safeNextPath(next, "/");

  // A relative Location header keeps the browser on the public origin even
  // when Next.js receives an internal localhost URL from a reverse proxy.
  return new NextResponse(null, {
    status: 303,
    headers: { Location: location },
  });
}
