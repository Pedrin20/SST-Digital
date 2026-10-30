import { NextResponse } from "next/server";
import { encaminhar } from "../../empresas/handlers";
import { unidadePayload } from "@/src/lib/unidades/schema";
type Context = { params: Promise<{ id: string }> };
const valid = (id: string) => /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!valid(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/unidades/${id}`);
}
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!valid(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  const result = unidadePayload.partial().refine(value => Object.keys(value).length > 0).safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ message: "Revise os dados da unidade.", fields: result.error.flatten().fieldErrors }, { status: 400 });
  return encaminhar(`/unidades/${id}`, { method: "PATCH", body: JSON.stringify(result.data) });
}
