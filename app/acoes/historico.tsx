import { useEffect, useState } from "react";
import { historicoSchema } from "@/src/lib/acoes/schema";
import { etapas, formatarData } from "./visoes";

export function Historico({ id }: {id: number}) {
  const [eventos, setEventos] = useState<ReturnType<typeof historicoSchema.parse>>([]);
  const [carregando, setCarregando] = useState(true), [erro, setErro] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      try {
        const r = await fetch(`/api/acoes/${id}/historico`, { signal: controller.signal });
        if (!r.ok) throw new Error("Histórico indisponível.");
        const dados = historicoSchema.parse(await r.json());
        if (!controller.signal.aborted) setEventos(dados);
      } catch { if (!controller.signal.aborted) setErro("Não foi possível consultar o histórico."); }
      finally { if (!controller.signal.aborted) setCarregando(false); }
    }
    void carregar();
    return () => controller.abort();
  }, [id]);
  return <details className="rounded-lg border border-line p-3 text-sm"><summary className="cursor-pointer font-semibold">Histórico e evidências</summary>
    {erro || carregando || !eventos.length ? <p className="mt-2 text-muted">{erro || (carregando ? "Carregando…" : "Nenhum registro de histórico.")}</p> :
      <ol className="mt-2 max-h-64 space-y-3 overflow-auto">{eventos.map(e => <li key={e.id} className="border-t border-line pt-2">
        <strong>{e.autor ?? "Usuário indisponível"}</strong> · {formatarData(e.criado_em)}{e.status && <p>{etapas[e.status] ?? e.status}</p>}
        {e.motivo_cancelamento && <p className="whitespace-pre-wrap break-words">Motivo: {e.motivo_cancelamento}</p>}
        {e.observacao && <p className="whitespace-pre-wrap break-words">{e.observacao}</p>}
        {e.arquivo_nome && <a className="break-all text-brand-900 underline" href={`/api/acoes/${id}/evidencias/${e.id}`} download>{e.arquivo_nome}</a>}
      </li>)}</ol>}</details>;
}
