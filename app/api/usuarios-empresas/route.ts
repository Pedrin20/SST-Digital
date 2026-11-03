import { NextResponse } from "next/server";
import { encaminhar } from "../empresas/handlers";
import { vinculoPayload } from "@/src/lib/usuarios-empresas/schema";
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const limit = input.get("limit") ?? "50", offset = input.get("offset") ?? "0";
  const integer = (value: string, min: number) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= min;
  if (!integer(limit, 1) || !integer(offset, 0)) return NextResponse.json({ message: "Paginação inválida." }, { status: 400 });
  return encaminhar(`/usuarios-empresas?${new URLSearchParams({ limit, offset })}`);
}
export async function POST(request: Request) {
  const result = vinculoPayload.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise os dados do vínculo.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar("/usuarios-empresas", { method: "POST", body: JSON.stringify(result.data) });
}
