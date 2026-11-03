import { NextResponse } from "next/server";
import { encaminhar } from "../empresas/handlers";
import { equipamentoPayload } from "@/src/lib/equipamentos/schema";
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = input.get("limit") ?? "50", offset = input.get("offset") ?? "0", setor = input.get("setor_id"), status = input.get("status");
  const integer = (value: string, min: number) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= min;
  if (!integer(limit, 1) || !integer(offset, 0) || (setor !== null && !integer(setor, 1)) || (status !== null && !status.trim())) return NextResponse.json({ message: "Filtro inválido." }, { status: 400 });
  const query = new URLSearchParams({ limit, offset });
  if (setor !== null) query.set("setor_id", setor);
  if (status !== null) query.set("status", status.trim());
  return encaminhar(`/equipamentos?${query}`);
}
export async function POST(request: Request) {
  const result = equipamentoPayload.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise os dados do equipamento.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar("/equipamentos", { method: "POST", body: JSON.stringify(result.data) });
}
