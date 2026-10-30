import { NextResponse } from "next/server";
import { encaminhar } from "../../empresas/handlers";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/avaliacoes-risco/${id}`);
}
