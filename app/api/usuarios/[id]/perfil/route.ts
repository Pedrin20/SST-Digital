import { NextResponse } from "next/server";
import { encaminhar } from "../../../empresas/handlers";

type Context = { params: Promise<{ id: string }> };
const valid = (id: string) => /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!valid(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/usuarios/${id}/perfil`);
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!valid(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/usuarios/${id}/perfil`, { method: "DELETE" });
}
