import { NextResponse } from "next/server";
import { encaminhar } from "../empresas/handlers";
import { avaliacaoPayload } from "@/src/lib/avaliacoes-risco/schema";
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = input.get("limit") ?? "50", offset = input.get("offset") ?? "0", perigo = input.get("perigo_id");
  const integer = (value: string, min: number) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= min;
  if (!integer(limit, 1) || !integer(offset, 0) || (perigo !== null && !integer(perigo, 1))) return NextResponse.json({ message: "Filtro inválido." }, { status: 400 });
  const query = new URLSearchParams({ limit, offset });
  if (perigo !== null) query.set("perigo_id", perigo);
  return encaminhar(`/avaliacoes-risco?${query}`);
}
export async function POST(request: Request) {
  const result = avaliacaoPayload.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise os dados da avaliação.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar("/avaliacoes-risco", { method: "POST", body: JSON.stringify(result.data) });
}

