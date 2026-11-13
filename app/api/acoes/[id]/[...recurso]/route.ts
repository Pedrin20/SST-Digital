import { encaminhar } from "../../../empresas/handlers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; recurso: string[] }> }) {
  const { id, recurso } = await params;
  if (!/^[1-9]\d*$/.test(id)) return new Response(null, { status: 400 });
  if (recurso.length === 1 && recurso[0] === "historico") return encaminhar(`/acoes/${id}/historico`);
  if (recurso.length !== 2 || recurso[0] !== "evidencias" || !/^[1-9]\d*$/.test(recurso[1])) return new Response(null, { status: 404 });
  const resposta = await encaminhar(`/acoes/${id}/evidencias/${recurso[1]}`);
  if (!resposta.ok) return resposta;
  const { dados, nome } = await resposta.json();
  return new Response(Buffer.from(dados, "base64"), { headers: {
    "Content-Type": "application/octet-stream", "Cache-Control": "private, no-store",
    "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURIComponent(nome).replace(/'/g, "%27"),
    "X-Content-Type-Options": "nosniff",
  } });
}
