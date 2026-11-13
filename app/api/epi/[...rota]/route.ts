import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/src/lib/auth/cookies";

type Context = { params: Promise<{ rota: string[] }> };
const rotas: Record<string, RegExp> = {
  GET: /^(catalogo|trabalhadores|estoque|movimentos|trabalhadores\/[1-9]\d*\/ficha|movimentos\/[1-9]\d*\/comprovante)$/,
  POST: /^(catalogo|trabalhadores|movimentos)$/,
  PUT: /^catalogo\/[1-9]\d*$/,
  PATCH: /^catalogo\/[1-9]\d*$/,
  DELETE: /^catalogo\/[1-9]\d*(\/definitivo)?$/,
};

async function encaminhar(request: Request, context: Context) {
  const { rota } = await context.params;
  const [empresa, ...partes] = rota;
  const recurso = partes.join("/");
  const sessao = request.method === "GET" && rota.length === 1 && empresa === "sessao";
  if (!sessao && (!/^[1-9]\d*$/.test(empresa) || !rotas[request.method]?.test(recurso))) {
    return NextResponse.json({ message: "Rota de EPI inválida." }, { status: 404 });
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  const base = process.env.API_BASE_URL;
  if (!base) return NextResponse.json({ message: "API indisponível." }, { status: 503 });
  const path = sessao ? "/auth/me" : "/empresas/"+empresa+"/epi/"+recurso;
  try {
    const response = await fetch(base.replace(/\/$/, "") + path + new URL(request.url).search, {
      method: request.method, headers: { Authorization: "Bearer "+token, "Content-Type": "application/json" },
      body: ["POST","PUT","PATCH"].includes(request.method) ? await request.text() : undefined,
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000),
    });
    const dados = await response.json();
    if (sessao && response.ok) return NextResponse.json({ administrador: dados.administrador_sistema, vinculos: dados.vinculos }, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(dados, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Falha de comunicação com a API." }, { status: 502 });
  }
}
export { encaminhar as GET, encaminhar as POST, encaminhar as PUT, encaminhar as PATCH, encaminhar as DELETE };
