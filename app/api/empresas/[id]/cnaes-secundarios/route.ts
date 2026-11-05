import { NextResponse } from "next/server";
import { cnaeSecundarioPayload } from "@/src/lib/empresas/schema";
import { camposDeErro, encaminhar } from "../../handlers";

type Context = { params: Promise<{ id: string }> };

function idValido(id: string) {
  return /^\d+$/.test(id);
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!idValido(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  return encaminhar(`/empresas/${id}/cnaes-secundarios`);
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  if (!idValido(id)) return NextResponse.json({ message: "ID inválido." }, { status: 400 });

  const body: unknown = await request.json().catch(() => null);
  const result = cnaeSecundarioPayload.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Revise os dados do CNAE secundário.", fields: camposDeErro(result.error) },
      { status: 400 },
    );
  }

  return encaminhar(`/empresas/${id}/cnaes-secundarios`, {
    method: "POST",
    body: JSON.stringify(result.data),
  });
}
