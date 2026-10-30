import { NextResponse } from "next/server";
import { encaminhar } from "../empresas/handlers";
import { usuarioSchema } from "./schema";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = Number(params.get("limit") ?? 50);
  const offset = Number(params.get("offset") ?? 0);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(offset) || offset < 0) return NextResponse.json({ message: "Paginação inválida." }, { status: 400 });
  return encaminhar(`/usuarios?${new URLSearchParams({ limit: String(limit), offset: String(offset) })}`);
}

export async function POST(request: Request) {
  const result = usuarioSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Informe nome, e-mail válido, senha e situação." }, { status: 400 });
  return encaminhar("/usuarios", { method: "POST", body: JSON.stringify(result.data) });
}
