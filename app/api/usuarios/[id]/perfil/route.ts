import { NextResponse } from "next/server";
import { encaminhar } from "../../../empresas/handlers";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/usuarios/${id}/perfil`);
}
