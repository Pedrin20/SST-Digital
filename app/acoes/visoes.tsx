import type { ReactNode } from "react";
import { prioridades, type Acao } from "@/src/lib/acoes/schema";

const cores = {
  P1: "border-critical-border bg-critical-bg text-critical-text",
  P2: "border-high-border bg-high-bg text-high-text",
  P3: "border-medium-border bg-medium-bg text-medium-text",
};

function Prioridade({ valor }: { valor: Acao["prioridade"] }) {
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${valor ? cores[valor] : "border-line bg-white text-muted"}`}>
    {valor ? `${valor} · ${prioridades[valor]}` : "Sem classificação"}
  </span>;
}

const etapas: Record<string, string> = {
  PENDENTE: "A fazer", EM_ANDAMENTO: "Em andamento", CONCLUIDA: "Concluída", CANCELADA: "Cancelada",
};
const prazo = (item: Acao) => item.prazo.split("-").reverse().join("/");

export function Visoes({ rows, quadro, opcoes }: { rows: Acao[]; quadro: boolean; opcoes: (item: Acao) => ReactNode }) {
  if (!quadro) return <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <caption className="sr-only">Planos de ação</caption>
      <thead className="bg-cream-50 text-xs uppercase text-muted"><tr>
        {["Descrição", "Prioridade", "Perigo", "Responsável", "Prazo", "Status", "Opções"].map(label => <th key={label} scope="col" className="p-4">{label}</th>)}
      </tr></thead>
      <tbody className="divide-y divide-line">{rows.map(item => <tr key={item.id}>
        <td className="min-w-48 max-w-sm whitespace-pre-wrap break-words p-4"><small className="block text-muted">#{item.id}</small>{item.descricao}</td>
        <td className="p-4"><Prioridade valor={item.prioridade} /></td><td className="p-4">#{item.perigo_id}</td>
        <td className="p-4">#{item.responsavel_id}</td><td className="p-4">{prazo(item)}</td>
        <td className="p-4">{etapas[item.status.toUpperCase()] ?? item.status}</td><td className="p-4">{opcoes(item)}</td>
      </tr>)}</tbody>
    </table>
  </div>;

  const grupos = new Map<string, Acao[]>([["PENDENTE", []], ["EM_ANDAMENTO", []], ["CONCLUIDA", []]]);
  for (const item of rows) {
    const status = item.status.toUpperCase();
    if (!grupos.has(status)) grupos.set(status, []);
    grupos.get(status)!.push(item);
  }
  return <div className="grid items-start gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from(grupos, ([status, itens]) => <section key={status} className="min-w-0 rounded-xl border border-line bg-cream-50 p-3">
      <h2 className="mb-3 flex items-center justify-between border-b border-line pb-3 text-sm font-semibold">
        {etapas[status] ?? status.replaceAll("_", " ")}<span className="rounded-md bg-brand-50 px-2 text-brand-900">{itens.length}</span>
      </h2>
      {itens.length === 0 && <p className="py-4 text-center text-sm text-muted">Nenhuma ação nesta etapa</p>}
      <div className="space-y-3">{itens.map(item => <article key={item.id} className="space-y-3 rounded-lg border border-line bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2"><Prioridade valor={item.prioridade} /><span className="text-xs text-muted">#{item.id}</span></div>
        <h3 className="whitespace-pre-wrap break-words font-semibold">{item.descricao}</h3>
        <dl className="space-y-1 rounded-md bg-cream-50 p-3 text-sm">
          {[["Perigo", `#${item.perigo_id}`], ["Responsável", `#${item.responsavel_id}`], ["Prazo", prazo(item)]].map(([label, valor]) => <div className="flex justify-between gap-2" key={label}><dt className="text-muted">{label}</dt><dd>{valor}</dd></div>)}
        </dl>
        {opcoes(item)}
      </article>)}</div>
    </section>)}
  </div>;
}
