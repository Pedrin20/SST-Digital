import { NextResponse } from "next/server";
import { encaminhar } from "../../../handlers";

type Context = { params: Promise<{ id: string; cnaeId: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  const { id, cnaeId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(cnaeId)) {
    return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  }
  return encaminhar(`/empresas/${id}/cnaes-secundarios/${cnaeId}`, { method: "DELETE" });
}
