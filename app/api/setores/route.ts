import { NextResponse } from "next/server";
import { encaminhar } from "../empresas/handlers";
import { setorPayload } from "@/src/lib/setores/schema";
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = Number(input.get("limit") ?? 50), offset = Number(input.get("offset") ?? 0);
  const unidade = input.get("unidade_id"), ativo = input.get("ativo");
  if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(offset) || offset < 0 || (unidade !== null && (!/^\d+$/.test(unidade) || !Number.isSafeInteger(Number(unidade)) || Number(unidade) < 1)) || (ativo !== null && !["true", "false"].includes(ativo))) return NextResponse.json({ message: "Filtro inválido." }, { status: 400 });
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (unidade !== null) query.set("unidade_id", unidade);
  if (ativo !== null) query.set("ativo", ativo);
  return encaminhar(`/setores?${query}`);
}
export async function POST(request: Request) {
  const result = setorPayload.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise unidade, nome e situação.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar("/setores", { method: "POST", body: JSON.stringify(result.data) });
}

