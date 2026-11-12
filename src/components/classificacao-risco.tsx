import { niveisDeRisco, rotulosNivel } from "@/src/lib/avaliacoes-risco/risco";
import type { Avaliacao } from "@/src/lib/avaliacoes-risco/schema";

export const gruposDeRisco = {
  FISICO: { cor: "#16803A", fundo: "#E7F7EA" },
  QUIMICO: { cor: "#DA2031", fundo: "#FFF0F1" },
  BIOLOGICO: { cor: "#841D22", fundo: "#F6E7E6" },
  ERGONOMICO: { cor: "#E3B500", fundo: "#FFF7CA" },
  ACIDENTE: { cor: "#427ABC", fundo: "#EAF2FD" },
};

const cores = new Map([
  ["BAIXO", "#2E7D32"], ["MEDIO", "#F9A825"],
  ["ALTO", "#EF6C00"], ["MUITO_ALTO", "#C62828"],
]);

export function ClassificacaoRisco({ avaliacao }: { avaliacao: Avaliacao }) {
  const nivel = niveisDeRisco.find(codigo => codigo === avaliacao.nivel_risco);
  if (!nivel) return <span className="break-words text-sm text-muted">Nível legado · {avaliacao.nivel_risco}</span>;
  return <span className="inline-flex items-center gap-2 rounded-md border border-line px-2 py-1 text-xs font-semibold text-ink">
    <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ backgroundColor: cores.get(nivel) }} />
    {rotulosNivel[nivel]}
  </span>;
}
