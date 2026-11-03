import { NextResponse } from "next/server";
import { corpoEmpresa, encaminhar } from "../handlers";
import { FRASE_EXCLUSAO_EMPRESA } from "@/src/lib/empresas/exclusao";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/empresas/${id}`);
}
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  const result = await corpoEmpresa(request, true);
  if (!result.success) return NextResponse.json({ message: "Informe nome, CNPJ com 14 dígitos e situação." }, { status: 400 });
  return encaminhar(`/empresas/${id}`, { method: "PATCH", body: JSON.stringify(result.data) });
}
export async function DELETE(request: Request, { params }: Context) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("confirmacao" in body) || body.confirmacao !== FRASE_EXCLUSAO_EMPRESA) {
    return NextResponse.json({ message: "Digite a frase de confirmação exatamente como indicada." }, { status: 400 });
  }
  return encaminhar(`/empresas/${id}`, { method: "DELETE", body: JSON.stringify({ confirmacao: body.confirmacao }) });
}
