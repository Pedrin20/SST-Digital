import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/src/lib/auth/cookies";

/** Tela inicial: sem sessão, a aplicação começa no login; com sessão, o login não se repete. */
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (request.nextUrl.pathname === "/login") {
    return hasSession ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  return hasSession ? NextResponse.next() : NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/", "/login"] };
