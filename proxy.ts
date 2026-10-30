import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/src/lib/auth/cookies";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  return hasSession ? NextResponse.next() : NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/dashboard/:path*", "/empresas/:path*"] };
