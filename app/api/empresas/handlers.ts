import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiFetch, ApiError } from "@/src/lib/api/client";
import { SESSION_COOKIE } from "@/src/lib/auth/cookies";

export async function encaminhar(path: string, options: RequestInit = {}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  try {
    const data = await apiFetch(path, z.unknown(), { ...options, headers: { Authorization: `Bearer ${token}` } }, { accessErrors: false });
    return NextResponse.json(options.method === "POST" || options.method === "PATCH" ? { ok: true } : data, { status: options.method === "POST" ? 201 : 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      const status = error.status >= 400 && error.status < 600 ? error.status : 502;
      return NextResponse.json({ message: error.message, fields: error.fields }, { status });
    }
    return NextResponse.json({ message: "Não foi possível concluir a operação." }, { status: 500 });
  }
}

const payloadSchema = z.object({ nome: z.string().trim().min(1), cnpj: z.string().regex(/^\d{14}$/), ativo: z.boolean() });
export async function corpoEmpresa(request: Request, parcial = false) {
  const body = await request.json().catch(() => null);
  return (parcial ? payloadSchema.partial() : payloadSchema).safeParse(body);
}

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = Number(input.get("limit") ?? 50);
  const offset = Number(input.get("offset") ?? 0);
  const ativo = input.get("ativo");
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(offset) || offset < 0 || (ativo !== null && ativo !== "true" && ativo !== "false")) {
    return NextResponse.json({ message: "Filtro inválido." }, { status: 400 });
  }
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (ativo !== null) query.set("ativo", ativo);
  return encaminhar(`/empresas?${query}`);
}

export async function POST(request: Request) {
  const result = await corpoEmpresa(request);
  if (!result.success) return NextResponse.json({ message: "Informe nome, CNPJ com 14 dígitos e situação." }, { status: 400 });
  return encaminhar("/empresas", { method: "POST", body: JSON.stringify(result.data) });
}
