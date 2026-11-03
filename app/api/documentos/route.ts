import { NextResponse } from "next/server";
import { encaminhar } from "../empresas/handlers";
import { documentoPayload } from "@/src/lib/documentos/schema";
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = input.get("limit") ?? "50", offset = input.get("offset") ?? "0", unidade = input.get("unidade_id");
  const integer = (value: string, min: number) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= min;
  if (!integer(limit, 1) || !integer(offset, 0) || (unidade !== null && !integer(unidade, 1))) return NextResponse.json({ message: "Filtro inválido." }, { status: 400 });
  const query = new URLSearchParams({ limit, offset });
  if (unidade !== null) query.set("unidade_id", unidade);
  return encaminhar(`/documentos?${query}`);
}
export async function POST(request: Request) {
  const result = documentoPayload.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise os dados do documento.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar("/documentos", { method: "POST", body: JSON.stringify(result.data) });
}
