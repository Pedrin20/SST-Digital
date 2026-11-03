import { NextResponse } from "next/server";
import { encaminhar } from "../../empresas/handlers";
import { equipamentoPatch } from "@/src/lib/equipamentos/schema";
type Context = { params: Promise<{ id: string }> };
const valid = (id: string) => /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!valid(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/equipamentos/${id}`);
}
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!valid(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  const result = equipamentoPatch.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise os dados do equipamento.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar(`/equipamentos/${id}`, { method: "PATCH", body: JSON.stringify(result.data) });
}
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!valid(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/equipamentos/${id}`, { method: "DELETE" });
}
