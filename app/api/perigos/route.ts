import { NextResponse } from "next/server";
import { encaminhar } from "../empresas/handlers";
import { perigoPayload } from "@/src/lib/perigos/schema";
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = input.get("limit") ?? "50", offset = input.get("offset") ?? "0", setor = input.get("setor_id");
  const integer = (value: string, min: number) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= min;
  if (!integer(limit, 1) || !integer(offset, 0) || (setor !== null && !integer(setor, 1))) return NextResponse.json({ message: "Filtro inválido." }, { status: 400 });
  const query = new URLSearchParams({ limit, offset });
  if (setor !== null) query.set("setor_id", setor);
  return encaminhar(`/perigos?${query}`);
}
export async function POST(request: Request) {
  const result = perigoPayload.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise os dados do perigo.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar("/perigos", { method: "POST", body: JSON.stringify(result.data) });
}
