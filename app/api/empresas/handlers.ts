import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiFetch, ApiError } from "@/src/lib/api/client";
import { SESSION_COOKIE } from "@/src/lib/auth/cookies";

export async function encaminhar(path: string, options: RequestInit = {}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Sua sessão expirou. Entre novamente." }, { status: 401 });
  try {
    const data = await apiFetch(
      path,
      z.unknown(),
      { ...options, headers: { Authorization: `Bearer ${token}` } },
      { accessErrors: false },
    );
    if (data === undefined) return new NextResponse(null, { status: 204 });
    return NextResponse.json(
      options.method === "POST" || options.method === "PATCH" ? { ok: true } : data,
      { status: options.method === "POST" ? 201 : 200 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const status = error.status >= 400 && error.status < 600 ? error.status : 502;
      return NextResponse.json({ message: error.message, fields: error.fields }, { status });
    }
    return NextResponse.json({ message: "Não foi possível concluir a operação." }, { status: 500 });
  }
}

export function camposDeErro(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}

const CNPJ_VALIDO = /^[A-Za-z0-9]{12}\d{2}$/;
const TELEFONE_VALIDO = /^[0-9()+\-.\s]+$/;
const CNAE_VALIDO = /^[0-9./ -]{7,10}$/;

const payloadSchema = z
  .object({
    nome: z
      .string({ error: "Informe o nome da empresa." })
      .trim()
      .min(2, "Informe o nome da empresa (mínimo de 2 caracteres).")
      .max(150, "O nome deve ter no máximo 150 caracteres."),
    // O contrato aceita CNPJ alfanumérico e com máscara; normaliza antes de enviar.
    cnpj: z
      .string({ error: "Informe um CNPJ válido." })
      .trim()
      .transform(value => value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
      .refine(value => CNPJ_VALIDO.test(value), "Informe um CNPJ válido."),
    nome_fantasia: z.string().trim().min(1).max(150).nullable().optional(),
    telefone: z
      .string()
      .trim()
      .min(8, "Informe um telefone válido.")
      .max(20, "O telefone deve ter no máximo 20 caracteres.")
      .regex(TELEFONE_VALIDO, "Informe um telefone válido.")
      .nullable()
      .optional(),
    email: z
      .string()
      .trim()
      .max(254, "O e-mail deve ter no máximo 254 caracteres.")
      .refine(value => z.email().safeParse(value).success, "Informe um e-mail válido.")
      .nullable()
      .optional(),
    site: z.string().trim().max(255, "O site deve ter no máximo 255 caracteres.").nullable().optional(),
    cnae_principal: z
      .string()
      .trim()
      .regex(CNAE_VALIDO, "Informe um CNAE válido (7 a 10 caracteres).")
      .nullable()
      .optional(),
    ativo: z.boolean({ error: "Informe a situação da empresa." }),
  })
  .strict();

export async function corpoEmpresa(request: Request, parcial = false) {
  const body = await request.json().catch(() => null);
  return (parcial ? payloadSchema.partial() : payloadSchema).safeParse(body);
}

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = Number(input.get("limit") ?? 50);
  const offset = Number(input.get("offset") ?? 0);
  const ativo = input.get("ativo");
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    (ativo !== null && ativo !== "true" && ativo !== "false")
  ) {
    return NextResponse.json({ message: "Filtro inválido." }, { status: 400 });
  }
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (ativo !== null) query.set("ativo", ativo);
  return encaminhar(`/empresas?${query}`);
}

export async function POST(request: Request) {
  const result = await corpoEmpresa(request);
  if (!result.success) {
    return NextResponse.json(
      { message: "Revise os dados da empresa.", fields: camposDeErro(result.error) },
      { status: 400 },
    );
  }
  return encaminhar("/empresas", { method: "POST", body: JSON.stringify(result.data) });
}
