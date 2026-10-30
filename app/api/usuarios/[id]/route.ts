import { NextResponse } from "next/server";
import { encaminhar } from "../../empresas/handlers";
import { usuarioSchema } from "../schema";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/usuarios/${id}`);
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  const result = usuarioSchema.partial().safeParse(await request.json().catch(() => null));
  if (!result.success || !Object.keys(result.data).length) return NextResponse.json({ message: "Revise os dados informados." }, { status: 400 });
  return encaminhar(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(result.data) });
}
