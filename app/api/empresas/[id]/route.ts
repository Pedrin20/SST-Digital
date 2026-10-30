import { NextResponse } from "next/server";
import { corpoEmpresa, encaminhar } from "../handlers";

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
