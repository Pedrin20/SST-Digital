import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "@/src/lib/api/client";
import { autenticar } from "@/src/lib/auth/login";
import { createSession } from "@/src/lib/auth/session";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
});

function erroDeValidacao(issues: z.core.$ZodIssue[]) {
  const fields: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Não foi possível ler os dados enviados." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Revise os campos destacados.", fields: erroDeValidacao(parsed.error.issues) },
      { status: 422 },
    );
  }

  try {
    const token = await autenticar(parsed.data.email.trim(), parsed.data.senha);
    await createSession(token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 0) {
        return NextResponse.json(
          { message: "Não foi possível conectar ao serviço de autenticação. Verifique sua conexão e tente novamente." },
          { status: 503 },
        );
      }
      const status = [400, 401, 403, 422, 429].includes(error.status) ? error.status : 502;
      return NextResponse.json({ message: error.message, fields: error.fields }, { status });
    }
    console.error("Falha inesperada ao autenticar:", error);
    return NextResponse.json({ message: "Erro inesperado ao autenticar. Tente novamente." }, { status: 500 });
  }
}
