import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "./cookies";

/** Guarda o token da API em cookie httpOnly: o navegador nunca acessa o valor. */
export async function createSession(token: string, persist = false): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(persist ? { maxAge: SESSION_MAX_AGE } : {}),
  });
}

