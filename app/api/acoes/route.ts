import { NextResponse } from "next/server";
import { encaminhar } from "../empresas/handlers";
import { acaoPayload, prioridadeSchema } from "@/src/lib/acoes/schema";

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = input.get("limit") ?? "50", offset = input.get("offset") ?? "0";
  const perigo = input.get("perigo_id"), responsavel = input.get("responsavel_id"), status = input.get("status");
  const integer = (value: string, min: number) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= min;
  if (!integer(limit, 1) || !integer(offset, 0) || (perigo !== null && !integer(perigo, 1)) || (responsavel !== null && !integer(responsavel, 1)) || (status !== null && !status.trim())) return NextResponse.json({ message: "Filtro inválido." }, { status: 400 });
  const query = new URLSearchParams({ limit, offset });
  const prioridade = input.get("prioridade");
  if (prioridade !== null) {
    if (!prioridadeSchema.safeParse(prioridade).success) return NextResponse.json({ message: "Prioridade inválida." }, { status: 400 });
    query.set("prioridade", prioridade);
  }
  if (perigo !== null) query.set("perigo_id", perigo);
  if (responsavel !== null) query.set("responsavel_id", responsavel);
  if (status !== null) query.set("status", status.trim());
  return encaminhar(`/acoes?${query}`);
}
export async function POST(request: Request) {
  const result = acaoPayload.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise os dados da ação.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar("/acoes", { method: "POST", body: JSON.stringify(result.data) });
}
