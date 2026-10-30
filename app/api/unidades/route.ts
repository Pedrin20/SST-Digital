import { NextResponse } from "next/server";
import { encaminhar } from "../empresas/handlers";
import { unidadePayload } from "@/src/lib/unidades/schema";
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = Number(input.get("limit") ?? 50), offset = Number(input.get("offset") ?? 0);
  const empresa = input.get("empresa_id"), ativo = input.get("ativo");
  if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(offset) || offset < 0 || (empresa !== null && (!/^\d+$/.test(empresa) || !Number.isSafeInteger(Number(empresa)) || Number(empresa) < 1)) || (ativo !== null && !["true", "false"].includes(ativo))) return NextResponse.json({ message: "Filtro inválido." }, { status: 400 });
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (empresa !== null) query.set("empresa_id", empresa);
  if (ativo !== null) query.set("ativo", ativo);
  return encaminhar(`/unidades?${query}`);
}
export async function POST(request: Request) {
  const result = unidadePayload.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise empresa, nome, endereço e situação.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar("/unidades", { method: "POST", body: JSON.stringify(result.data) });
}
