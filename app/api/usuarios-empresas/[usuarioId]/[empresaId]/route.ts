import { NextResponse } from "next/server";
import { encaminhar } from "../../../empresas/handlers";
import { perfilPayload } from "@/src/lib/usuarios-empresas/schema";
type Context = { params: Promise<{ usuarioId: string; empresaId: string }> };
const valid = (id: string) => /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
export async function PATCH(request: Request, { params }: Context) {
  const { usuarioId, empresaId } = await params;
  if (!valid(usuarioId) || !valid(empresaId)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  const result = perfilPayload.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise o perfil.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar(`/usuarios-empresas/${usuarioId}/${empresaId}`, { method: "PATCH", body: JSON.stringify(result.data) });
}
export async function DELETE(_request: Request, { params }: Context) {
  const { usuarioId, empresaId } = await params;
  if (!valid(usuarioId) || !valid(empresaId)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/usuarios-empresas/${usuarioId}/${empresaId}`, { method: "DELETE" });
}
