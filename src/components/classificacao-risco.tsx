import type { Avaliacao } from "@/src/lib/avaliacoes-risco/schema";

export const gruposDeRisco = [
  { nome: "Físico", cor: "#16803A", fundo: "#E7F7EA" },
  { nome: "Químico", cor: "#DA2031", fundo: "#FFF0F1" },
  { nome: "Biológico", cor: "#841D22", fundo: "#F6E7E6" },
  { nome: "Ergonômico", cor: "#E3B500", fundo: "#FFF7CA" },
  { nome: "Acidente (Mecânico)", cor: "#427ABC", fundo: "#EAF2FD" },
];

const cores = new Map([
  ["BAIXO", "#2E7D32"], ["MEDIO", "#F9A825"],
  ["ALTO", "#EF6C00"], ["MUITO_ALTO", "#C62828"],
]);

export function ClassificacaoRisco({ avaliacao }: { avaliacao: Avaliacao }) {
  const { classificacao, classificacao_nome, classificacao_cor } = avaliacao;
  const grupo = gruposDeRisco.find(item => item.nome === classificacao);
  const corNivel = cores.get(classificacao ?? "");
  const cor = grupo?.cor ?? (classificacao_cor?.toUpperCase() === corNivel ? corNivel : undefined);
  return <span style={{ backgroundColor: grupo?.fundo }} className="inline-flex max-w-full items-center gap-2 rounded-md border border-line px-2 py-1 text-xs font-semibold text-ink">
    {cor &&
      <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ backgroundColor: cor }} />}
    <span className="min-w-0 break-words">{classificacao_nome || classificacao || "Não informada"}</span>
  </span>;
}
