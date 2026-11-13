import { useState, type ReactNode } from "react";
import { prioridades, type Acao } from "@/src/lib/acoes/schema";
import { Button } from "@/src/components/ui";

export const etapas: Record<string, string> = { PENDENTE: "A fazer", EM_ANDAMENTO: "Em andamento", CONCLUIDA: "Concluída", CANCELADA: "Cancelada" };
const cores = { P1: "border-l-critical", P2: "border-l-high", P3: "border-l-medium" };
const etiquetas = { P1: "bg-critical-bg text-critical-text", P2: "bg-high-bg text-high-text", P3: "bg-medium-bg text-medium-text" };
export const formatarData = (data: string) => data.slice(0, 10).split("-").reverse().join("/");
export function diasAtePrazo(item: Acao, hoje: number) {
  if (!item.prazo || ["CONCLUIDA", "CANCELADA"].includes(item.status.toUpperCase())) return null;
  return (Date.parse(item.prazo) - hoje) / 86400000;
}

function Prazo({ item, hoje }: {item: Acao; hoje: number}) {
  const dias = diasAtePrazo(item, hoje);
  const n = Math.abs(dias ?? 0);
  const tempo = n + (n === 1 ? " dia" : " dias");
  return <div><time dateTime={item.prazo ?? undefined}>{item.prazo ? formatarData(item.prazo) : "Sem prazo"}</time>
    {dias !== null && <p className={`text-xs font-semibold ${dias < 0 ? "text-critical-text" : dias <= 7 ? "text-orange-700" : "text-muted"}`}>{dias < 0 ? "Venceu há " + tempo : dias === 0 ? "Vence hoje" : "Vence em " + tempo}</p>}
    {item.concluida_em && item.status === "CONCLUIDA" && <p className="text-xs text-muted">Concluída em {formatarData(item.concluida_em)}</p>}</div>;
}
function Vinculo({ nome, id, avatar }: {nome?: string; id: number | null; avatar?: boolean}) {
  if (!id) return <span>Não informado</span>;
  const palavras = nome?.trim().split(/\s+/) ?? [];
  const iniciais = [palavras[0]?.[0], palavras.length > 1 ? palavras.at(-1)?.[0] : ""].join("").toLocaleUpperCase("pt-BR");
  return <span className="flex items-center gap-2">{avatar && iniciais && <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-900">{iniciais}</span>}
    <span className="min-w-0 break-words"><strong className="font-medium">{nome || "Nome indisponível"}</strong><small className="block text-muted">#{id}</small></span></span>;
}
type Props = {
  rows: Acao[]; quadro: boolean; hoje: number; ocupado: boolean;
  perigos: Map<number,string>; usuarios: Map<number,string>;
  opcoes: (item: Acao) => ReactNode; mover: (item: Acao, status: string) => void; criar: (status: string) => void;
};
export function Visoes({ rows, quadro, hoje, perigos, usuarios, ocupado, opcoes, mover, criar }: Props) {
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [destino, setDestino] = useState("");
  const prioridade = (item: Acao) => <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${item.prioridade ? etiquetas[item.prioridade] : "bg-cream-50 text-muted"}`}>{item.prioridade ? item.prioridade + " · " + prioridades[item.prioridade] : "Sem classificação"}</span>;
  const perigo = (item: Acao) => <Vinculo nome={item.perigo_nome ?? perigos.get(item.perigo_id)} id={item.perigo_id}/>;
  const responsavel = (item: Acao) => <Vinculo nome={item.responsavel_nome ?? usuarios.get(item.responsavel_id ?? 0)} id={item.responsavel_id} avatar/>;
  if (!quadro) return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Planos de ação</caption>
    <thead className="bg-cream-50 text-xs uppercase text-muted"><tr>{["Descrição","Prioridade","Perigo","Responsável","Prazo","Status","Opções"].map(label => <th scope="col" className="p-4" key={label}>{label}</th>)}</tr></thead>
    <tbody className="divide-y divide-line">{rows.map(item => <tr key={item.id}><td className="min-w-48 p-4">{item.descricao}<small className="block text-muted">#{item.id}</small></td>
      <td className="p-4">{prioridade(item)}</td><td className="p-4">{perigo(item)}</td><td className="p-4">{responsavel(item)}</td><td className="p-4"><Prazo item={item} hoje={hoje}/></td>
      <td className="p-4">{etapas[item.status] ?? item.status}</td><td className="p-4">{opcoes(item)}</td></tr>)}</tbody></table></div>;
  const grupos = new Map(Object.keys(etapas).map(s => [s, [] as Acao[]]));
  for (const item of rows) {
    const status = item.status.toUpperCase();
    if (!grupos.has(status)) grupos.set(status, []);
    grupos.get(status)!.push(item);
  }
  return <div className="grid grid-flow-col auto-cols-[minmax(16rem,1fr)] items-start gap-3 overflow-x-auto p-4">
    {Array.from(grupos, ([status, itens]) => <section key={status}
      onDragOver={e => { if (arrastando !== null && etapas[status] && !ocupado) { e.preventDefault(); setDestino(status); } }}
      onDrop={e => { e.preventDefault(); const item = rows.find(r => r.id === arrastando); setDestino(""); setArrastando(null); if (item && item.status !== status && etapas[status] && !ocupado) mover(item, status); }}
      className={`min-w-0 rounded-xl border bg-cream-50 p-3 ${destino === status ? "border-brand-600" : "border-line"}`}>
      <h2 className="mb-3 flex justify-between border-b border-line pb-3 text-sm font-semibold">{etapas[status] ?? status}<span>{itens.length}</span></h2>
      {!itens.length && <p className="py-4 text-center text-sm text-muted">Nenhuma ação nesta etapa</p>}
      <div className="space-y-3">{itens.sort((a,b) => (a.prazo ?? "9999").localeCompare(b.prazo ?? "9999") || a.id-b.id).map(item =>
        <article key={item.id} draggable={!ocupado} onDragStart={e => { e.dataTransfer.setData("text/plain", String(item.id)); e.dataTransfer.effectAllowed = "move"; setArrastando(item.id); }} onDragEnd={() => { setArrastando(null); setDestino(""); }}
          className={`space-y-3 rounded-lg border border-l-4 border-line bg-white p-3 shadow-card ${item.prioridade ? cores[item.prioridade] : ""}`}>
          <div className="flex justify-between gap-2">{prioridade(item)}<small className="text-muted">#{item.id}</small></div>
          <h3 className="whitespace-pre-wrap break-words font-semibold">{item.descricao}</h3>
          <dl className="space-y-2 text-sm">{[["Perigo", perigo(item)], ["Responsável", responsavel(item)], ["Prazo", <Prazo key="prazo" item={item} hoje={hoje}/>]] .map(([label, valor]) => <div key={String(label)}><dt className="text-xs text-muted">{label}</dt><dd>{valor}</dd></div>)}</dl>
          {opcoes(item)}
        </article>)}</div>
      {["PENDENTE","EM_ANDAMENTO"].includes(status) && <Button variant="ghost" disabled={ocupado} onClick={() => criar(status)}>+ Nova ação</Button>}
    </section>)}</div>;
}
